import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import { getUserPlan } from '@/lib/getUserPlan'
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const MODEL_PRO = 'gemini-3.1-pro-preview'
const MODEL_PRO_FALLBACK = 'gemini-3.5-flash'
const MODEL_FREE = 'gemini-3.1-flash-lite'
const REQUEST_TIMEOUT_MS = 15_000

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini API timeout after ${ms / 1000}s`)), ms)
    )
  ])
}

function isRetryableError(msg) {
  return msg.includes('429') || msg.includes('503') || msg.includes('quota') ||
    msg.includes('Too Many Requests') || msg.includes('Service Unavailable') ||
    msg.includes('high demand') || msg.includes('fetch failed') || msg.includes('timeout')
}

async function callGeminiWithChain(genAI, modelChain, content, tag = 'generate-outfit') {
  let lastError
  for (let i = 0; i < modelChain.length; i++) {
    const modelName = modelChain[i]
    try {
      console.log(`[${tag}] Trying model: ${modelName}${i > 0 ? ' (fallback)' : ''}`)
      const model = genAI.getGenerativeModel({ model: modelName })
      return await withTimeout(model.generateContent(content), REQUEST_TIMEOUT_MS)
    } catch (error) {
      lastError = error
      const msg = error.message || ''
      if (i < modelChain.length - 1 && isRetryableError(msg)) {
        console.log(`[${tag}] ${modelName} failed (${msg.slice(0, 80)}...). Trying next fallback...`)
        continue
      }
      throw error
    }
  }
  throw lastError
}

export async function POST(request) {
  try {
    // 1. Validar sessió
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    // 2. Llegir les dades de la petició
    const { occasion, weather, weatherData, style, previousCombination, clientHour } = await request.json()

    if (!occasion || !weather) {
      return NextResponse.json({ error: 'Ocasió i temps són requerits' }, { status: 400 })
    }

    // 2.5. Comprovar límits del pla
    const userPlan = await getUserPlan(supabase, user.id)
    if (userPlan && userPlan.outfitGenerationsUsed >= userPlan.limits.maxOutfitGenerations) {
      return NextResponse.json({ 
        error: 'Has esgotat els teus outfits gratuïts d\'aquest mes.',
        upgrade: true,
        reason: 'outfits'
      }, { status: 403 })
    }

    // 3. Obtenir l'armari de l'usuari
    const { data: garments, error: fetchError } = await supabase
      .from('garments')
      .select('id, category, subcategory, color, secondary_color, pattern, material, formality, warmth, fit, season, tags, description')
      .eq('user_id', user.id)

    if (fetchError || !garments || garments.length < 2) {
      return NextResponse.json({ 
        error: 'Necessites almenys 2 peces de roba a l\'armari per generar un outfit.' 
      }, { status: 400 })
    }

    // 3.5. Obtenir últims outfits (per no repetir)
    const { data: recentOutfits } = await supabase
      .from('outfits')
      .select('garment_ids, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    let historyContext = ''
    if (recentOutfits && recentOutfits.length > 0) {
      const pastCombos = recentOutfits.map((o, idx) => `Outfit ${idx+1}: IDs [${o.garment_ids.join(', ')}]`).join('\n')
      historyContext = `\nIMPORTANT: L'usuari ha usat recentment aquestes combinacions. INTENTA NO REPETIR EXACTAMENT els mateixos IDs junts:\n${pastCombos}\n`
    }
    
    // Si l'usuari ha demanat regenerar (una altra opció)
    if (previousCombination && previousCombination.length > 0) {
      historyContext += `\nCRÍTIC: L'usuari acaba de rebutjar la següent combinació: [${previousCombination.join(', ')}]. ESTÀ TOTALMENT PROHIBIT suggerir exactament aquesta combinació. Has de proposar alguna cosa diferent.\n`
    }

    // 4. Preparar el prompt
    const garmentsList = garments.map(g => 
      `- ID: ${g.id} | Cat: ${g.category}${g.subcategory ? ` (${g.subcategory})` : ''} | Color: ${g.color || '?'}${g.secondary_color ? ` + ${g.secondary_color}` : ''} | Patró: ${g.pattern || 'llis'} | Material: ${g.material || '?'} | Formalitat: ${g.formality || 3}/5 | Calidesa: ${g.warmth || 3}/5 | Fit: ${g.fit || '?'} | Temporades: ${g.season?.join(',') || '?'} | Tags: ${g.tags?.join(', ') || 'Cap'}`
    ).join('\n')

    let weatherContext = `un temps: "${weather}"`
    if (weatherData) {
      weatherContext = `les següents condicions meteorològiques REALS a ${weatherData.cityName}:
- Temperatura: ${weatherData.temp}°C (sensació tèrmica: ${weatherData.feels_like}°C)
- Condicions: ${weatherData.description}
- Humitat: ${weatherData.humidity}%
- Vent: ${weatherData.wind_speed} km/h
${weatherData.rain ? `- Pluja: ${weatherData.rain} mm/h` : '- Sense precipitacions'}

Tingues en compte aquestes condicions per recomanar la roba.`
    }

    // Context temporal — usar hora del client si disponible per precisió timezone
    const currentHour = clientHour != null ? clientHour : new Date().getHours()
    const timeOfDay = currentHour < 12 ? 'matí' : currentHour < 20 ? 'tarda' : 'nit'
    const days = ['diumenge', 'dilluns', 'dimarts', 'dimecres', 'dijous', 'divendres', 'dissabte']
    const dayOfWeek = days[new Date().getDay()]
    const month = new Date().getMonth()
    let currentSeason = 'hivern'
    if (month >= 2 && month <= 4) currentSeason = 'primavera'
    else if (month >= 5 && month <= 7) currentSeason = 'estiu'
    else if (month >= 8 && month <= 10) currentSeason = 'tardor'

    let styleContext = ''
    if (style) {
      styleContext = `\nPREFERÈNCIA D'ESTIL: L'usuari ha demanat específicament un estil "${style}". Prioritza peces i combinacions que encaixin amb aquesta estètica.\n`
    }

    const prompt = `Ets un estilista personal expert. Context actual:
- Moment: És ${dayOfWeek} al ${timeOfDay}.
- Estació aproximada: ${currentSeason}.
- Temps: L'usuari té ${weatherContext}
${styleContext}${historyContext}
L'usuari vol crear un outfit per a l'ocasió: "${occasion}".
Té les següents peces al seu armari:

${garmentsList}

Selecciona les peces que millor combinin. Regles:
- Retorna NOMÉS un JSON vàlid.
- L'outfit ha de tenir entre 2 i 5 peces.
- Categories disponibles: samarreta, camisa, punt, dessuadora, jaqueta, pantalons, vestit, sabates, accessori, altres.
- NO repeteixis categories principals (no 2 pantalons, no 2 sabates).
- Regla de capes superior: pots combinar una capa base (samarreta o camisa) + una capa intermèdia (punt o dessuadora) + una capa exterior (jaqueta), però MAI dues peces de la MATEIXA capa. Per exemple:
  · ✅ samarreta + dessuadora + jaqueta (3 capes)
  · ✅ camisa + jersei (punt) (2 capes)
  · ❌ samarreta + camisa (dues capes base)
  · ❌ dessuadora + jersei (punt) (dues capes intermèdies)
- Combina colors harmònicament (complementaris, anàlegs o monocromàtics).
- NO barregis patrons conflictius (ex: ratlles + quadres). Llis i logo_grafic combinen amb tot.
- Ajusta la CALIDESA (warmth) a la temperatura real: fred→peces càlides, calor→peces fresques.
- Respecta la FORMALITAT de l'ocasió i de l'estil demanat.
- Usa estrictament els IDs proporcionats.

JSON esperat:
{
  "garment_ids": ["id1", "id2"],
  "explanation": "Explicació curta (màx 50 paraules) de per què l'outfit funciona bé per l'ocasió, temps i estil.",
  "style_tip": "Un consell pràctic de com portar-ho (ex: remanga't la camisa, posa la samarreta per dins).",
  "match_score": 95,
  "color_harmony": "Ex: Monocromàtic, Complementari, Colors Neutres..."
}`

    // 5. Cridar a Gemini amb fallback automàtic
    const isPro = userPlan?.plan === 'pro'
    const modelChain = isPro
      ? [MODEL_PRO, MODEL_PRO_FALLBACK, MODEL_FREE]
      : [MODEL_FREE]

    const generationConfig = {
      temperature: previousCombination ? 0.95 : 0.7,
      topK: 40,
      topP: 0.95,
      responseMimeType: "application/json",
    }

    const result = await callGeminiWithChain(genAI, modelChain, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    })

    const responseText = result.response.text()
    
    // Netejar possible markdown
    const jsonString = responseText.replace(/```json\n?|\n?```/g, '').trim()
    const outfitData = JSON.parse(jsonString)

    // Validar que ens hagi retornat IDs vàlids
    const validIds = outfitData.garment_ids.filter(id => 
      garments.some(g => g.id === id)
    )

    if (validIds.length < 2) {
      return NextResponse.json({ 
        error: 'La IA no ha pogut generar una combinació vàlida amb la teva roba.' 
      }, { status: 400 })
    }

    outfitData.garment_ids = validIds

    // 6. Incrementar comptador si és free
    if (userPlan && userPlan.plan === 'free') {
      await supabase
        .from('profiles')
        .update({ outfit_generations_used: userPlan.outfitGenerationsUsed + 1 })
        .eq('id', user.id)
    }

    return NextResponse.json(outfitData)

  } catch (error) {
    console.error('Error generating outfit:', error)

    const msg = error.message || ''
    if (msg.includes('timeout')) {
      return NextResponse.json(
        { error: 'La connexió amb la IA ha trigat massa. Torna-ho a provar.' },
        { status: 504 }
      )
    }
    if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
      return NextResponse.json(
        { error: 'El servei d\'IA està temporalment saturat. Torna-ho a provar d\'aquí uns minuts.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Error intern al generar outfit' }, 
      { status: 500 }
    )
  }
}
