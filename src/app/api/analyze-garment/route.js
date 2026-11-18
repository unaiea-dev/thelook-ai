import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/utils/supabase/server'
import { getUserPlan } from '@/lib/getUserPlan'
import { NextResponse } from 'next/server'

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const MODEL_PRO = 'gemini-3.1-pro-preview'
const MODEL_PRO_FALLBACK = 'gemini-3.5-flash'
const MODEL_FREE = 'gemini-3.1-flash-lite'
const REQUEST_TIMEOUT_MS = 25_000

function withTimeout(promise, ms, signal) {
  const promises = [
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini API timeout after ${ms / 1000}s`)), ms)
    )
  ]
  if (signal) {
    promises.push(
      new Promise((_, reject) => {
        if (signal.aborted) {
          return reject(new DOMException('Aborted', 'AbortError'))
        }
        signal.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'))
        }, { once: true })
      })
    )
  }
  return Promise.race(promises)
}

function isRetryableError(msg) {
  return msg.includes('429') || msg.includes('503') || msg.includes('quota') ||
    msg.includes('Too Many Requests') || msg.includes('Service Unavailable') ||
    msg.includes('high demand') || msg.includes('fetch failed') || msg.includes('timeout')
}

async function callGeminiWithChain(genAI, modelChain, content, tag = 'analyze-garment', signal) {
  let lastError
  for (let i = 0; i < modelChain.length; i++) {
    const modelName = modelChain[i]
    try {
      if (signal?.aborted) {
        throw new DOMException('Request aborted by client', 'AbortError')
      }
      console.log(`[${tag}] Trying model: ${modelName}${i > 0 ? ' (fallback)' : ''}`)
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await withTimeout(model.generateContent(content), REQUEST_TIMEOUT_MS, signal)
      return result
    } catch (error) {
      if (error.name === 'AbortError' || signal?.aborted) {
        throw new DOMException('Request aborted by client', 'AbortError')
      }
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
    if (request.signal?.aborted) {
      return new Response(null, { status: 499 })
    }
    // 1. Authenticate user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const userPlan = await getUserPlan(supabase, user.id)
    const isPro = userPlan?.plan === 'pro'
    const modelChain = isPro
      ? [MODEL_PRO, MODEL_PRO_FALLBACK, MODEL_FREE]
      : [MODEL_FREE]

    // 2. Parse request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('[analyze-garment] Failed to parse request body:', parseError.message)
      return NextResponse.json(
        { error: 'Error al llegir la imatge. Potser és massa gran.' }, 
        { status: 413 }
      )
    }

    const { image } = body
    
    if (!image) {
      return NextResponse.json({ error: 'No s\'ha proporcionat cap imatge' }, { status: 400 })
    }

    // Convert base64 data URL to just the base64 string
    const base64Data = image.split(',')[1]
    if (!base64Data) {
      return NextResponse.json({ error: 'Format d\'imatge invàlid' }, { status: 400 })
    }

    // 3. Call Gemini API with automatic fallback
    const prompt = `Ets un estilista professional amb 20 anys d'experiència en moda. La teva feina és analitzar fotografies de peces de roba amb precisió experta per a un armari digital intel·ligent.

INSTRUCCIONS D'ANÀLISI — Segueix aquests passos mentalment abans de respondre:

1. IDENTIFICA LA PEÇA: Què és exactament? No et quedis amb "samarreta" si és un polo, una brusa, un crop top o una camiseta de tirants. Sigues específic.

2. OBSERVA ELS COLORS: Mira tota la superfície. Hi ha un segon color significatiu (>15% de la superfície)? Distingeix entre tons: no és el mateix "blau marí" que "blau cel" o "blau elèctric".

3. ANALITZA EL PATRÓ/ESTAMPAT: Sigues molt precís:
   - Si la tela és d'un sol color sense cap dibuix → "llis"
   - Si té un LOGO, TEXT, DIBUIX GRÀFIC o imatge impresa → "logo_grafic" (NO "estampat")
   - Si té un patró textil REPETITIU (flowers, paisley, etc.) → usa la categoria específica (floral, paisley, etc.)
   - Si la peça combina BLOCS DE COLORS SÒLIDS (ex: mànigues d'un color, cos d'un altre) → "color_block"
   - Ratlles horitzontals ≠ ratlles verticals → tot és "ratlles"
   - Quadres tipus tartà ≠ quadres vichy → tot és "quadres"
   - Si la textura del teixit és visible (punt, trena, gofre, rib) però no hi ha dibuix → "textura"

4. DEDUEIX EL MATERIAL: Busca pistes visuals — el denim té una textura característica, la llana es veu teixida, el cuir brilla, el cotó és mat, el polièster té un lleuger brillantor artificial, la felpa és gruixuda i suau per dins.

5. AVALUA FORMALITAT I CALIDESA: Pensa en CONTEXT D'ÚS real:
   - Formalitat: Ho portaries a una entrevista de feina (5)? O només per estar a casa (1)?
   - Calidesa: Quanta protecció tèrmica dona? Una samarreta de tirants = 1, un jersei gruixut de llana = 4, un plomífer = 5.

6. DETERMINA EL TALLATGE/FIT: Mira les proporcions — ajustat al cos? Caiguda recta i àmplia? Talla per sobre del melic (crop)?

⚠️ REGLES CRÍTIQUES DE CLASSIFICACIÓ — Llegeix amb atenció:

Les CATEGORIES defineixen la FUNCIÓ de la peça, NO la capa que ocupen. Aquestes regles són OBLIGATÒRIES:

• Un JERSEI (jersey) NO és una jaqueta → és "punt" (es porta com a capa intermèdia, no com a capa exterior)
• Una DESSUADORA / HOODIE NO és una jaqueta → és "dessuadora" (és roba còmoda, no abric)
• Una CAMISA / BLUSA NO és una samarreta → és "camisa" (té coll, botó, i és més formal)
• Un CÀRDIGAN NO és una jaqueta → és "punt" (és de punt, es porta obert sobre la roba)
• Un BLAZER SÍ és una jaqueta → és abrigall formal
• Un ABRIC / PARKA / PLOMÍFER SÍ és una jaqueta → és capa exterior

CATEGORIES I SUBCATEGORIES — Guia de classificació:

• samarreta → camiseta, polo, crop_top, samarreta_tirants, camiseta_màniga_llarga, top, cos, samarreta_esportiva
  (peces lleugeres de punt o cotó, sense botons, informals, capa base)

• camisa → camisa, blusa, camisa_vaquera, camisa_hawaiana, camisa_estampada, camisa_franela, camisa_lli
  (peces amb coll i botons, tant formals com informals)

• punt → jersei, càrdigan, jersei_coll_alt, jersei_fi, xaqueta_punt, polo_punt, vest
  (peces de punt/llana/cotó gruixut SENSE caputxa ni cremallera central, capa intermèdia)

• dessuadora → hoodie, dessuadora_oberta, dessuadora_tancada, felpa, sudadera_crop, polar
  (peces de felpa/cotó gruixut, sovint amb caputxa, estil casual/esportiu)

• jaqueta → jaqueta_denim, bomber, parka, plomífer, caçadora, blazer, anorac, impermeable, abric, gabardina, trench, jaqueta_cuir, jaqueta_tècnica
  (NOMÉS capa exterior: abrics, jaquetes amb cremallera/botons que es porten SOBRE la resta de roba)

• pantalons → vaquers, xinesos, joggers, bermudes, pantalons_curts, leggings, pantalons_vestir, cargo, faldilla, faldilla_llarga
  (tota la part inferior)

• vestit → vestit_llarg, vestit_curt, vestit_casual, vestit_nit, mono, conjunt
  (peces completes d'una sola peça o conjunts inseparables)

• sabates → vambes, botes, botins, sandàlies, sabatilles, mocassins, sabates_vestir, espardenyes, talons, xancles
  (tot el calçat)

• accessori → gorra, barret, bufanda, cinturó, rellotge, ulleres_sol, motxilla, bossa, collar, polsera, arracades
  (complements que no són roba principal)

• altres → per peces que no encaixin en cap categoria anterior

ESCALA DE FORMALITAT (sigues precís):
1 = Pijama, roba interior, xancles de platja, samarreta molt desgastada
2 = Casual diari: vambes, samarretes, vaquers, dessuadores, hoodies
3 = Smart casual: polo, xinesos, jersei fi, botins, camisa informal
4 = Semi-formal: camisa, pantalons vestir, blazer, sabates cuir
5 = Formal: vestit sencer, corbata, sabates vestir, roba de gala

ESCALA DE CALIDESA (pensa en temperatura):
1 = Molt fresc: tirants, pantalons curts, sandàlies, tops lleugers
2 = Fresc: samarreta màniga curta, vaquers prims, sabatilles
3 = Temperat: camisa màniga llarga, pantalons llargs, jersei fi
4 = Càlid: jersei gruixut, dessuadora, hoodie, pantalons gruixuts, botes
5 = Molt càlid: abric d'hivern, plomífer, bufanda, guants, llana gruixuda

COLORS — Sigues específic en català:
Evita dir simplement "blau". Digues: blau marí, blau cel, blau elèctric, blau petroli.
Evita dir simplement "verd". Digues: verd oliva, verd fosc, verd menta, verd esmeralda.
Evita dir "beix" si és cru, crema, camel o caramel — cada to és diferent.

PATRONS/ESTAMPATS — Exemples per no confondre's:
- "llis" → color sòlid únic, sense cap dibuix ni textura visible
- "logo_grafic" → logo de marca, text imprès, dibuix serigrafiado, il·lustració, emoji, foto impresa
- "ratlles" → línies repetitives (horitzontals, verticals, marineres, pin-stripe)
- "quadres" → tartà, vichy, príncep de gal·les, madràs, buffalo check
- "floral" → flors, motius botànics, tropicals
- "estampat" → dibuixos repetitius abstractes o concrets (calaveres, estrelles, còmic, etc.)
- "geomètric" → triangles, cercles, rombes, patrons abstractes regulars
- "animal_print" → lleopard, zebra, serp, vaca
- "degradat" → transició suau d'un color a un altre (ombré, dip-dye)
- "color_block" → blocs de colors sòlids separats (mànigues, cos, bandes)
- "paisley" → gotes corbes, caixmir, bandana pattern
- "tie_dye" → colors desiguals per tenyit artesanal
- "textura" → el patró és la mateixa textura del teixit (punt trena, rib, gofre) sense dibuix afegit
- "altres" → qualsevol patró que no encaixi en les anteriors

FORMAT DE RESPOSTA — Retorna EXCLUSIVAMENT un JSON vàlid:
{
  "category": "una de: samarreta|camisa|punt|dessuadora|jaqueta|pantalons|vestit|sabates|accessori|altres",
  "subcategory": "el tipus específic (consulta la guia de dalt)",
  "color": "color principal específic en català",
  "secondary_color": "segon color (>15% superfície) o null",
  "pattern": "una de: llis|logo_grafic|ratlles|quadres|floral|estampat|geomètric|animal_print|degradat|color_block|paisley|tie_dye|textura|altres",
  "material": "una de: cotó|polièster|llana|denim|cuir|lli|seda|niló|punt|felpa|teixit_tècnic|altres",
  "formality": 3,
  "warmth": 3,
  "fit": "una de: ajustat|regular|oversized|crop|ample",
  "season": ["estacions recomanades entre: primavera|estiu|tardor|hivern"],
  "brand": "marca visible o null",
  "description": "descripció natural en català, màxim 25 paraules, com la faries a un amic",
  "tags": ["3-5 tags útils: estil, ocasió, vibe — ex: urbà, elegant, esportiu, platja, oficina, date_night"]
}

IMPORTANT:
- NO escriguis res fora del JSON.
- RECORDA: jerseis i càrdigans = "punt", dessuadores i hoodies = "dessuadora", camises = "camisa". MAI a "jaqueta" si no és capa exterior.
- Un logo o gràfic imprès = "logo_grafic", NO "estampat". "estampat" és per patrons repetitius.
- Els tags han de ser ÚTILS per combinar outfits, no repetir info dels altres camps.
- La descripció ha de ser natural i descriptiva, no tècnica.
- Si no estàs segur del material, estima el més probable basant-te en l'aparença visual.
`
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: 'image/jpeg'
      }
    }

    const result = await callGeminiWithChain(
      genAI,
      modelChain,
      [prompt, imagePart],
      'analyze-garment',
      request.signal
    )
    const responseText = result.response.text()
    
    // Clean up potential markdown formatting from Gemini response
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
    
    let garmentData
    try {
      garmentData = JSON.parse(cleanJson)
      
      // Validar y normalizar campos
      garmentData.formality = Math.min(5, Math.max(1, parseInt(garmentData.formality) || 3))
      garmentData.warmth = Math.min(5, Math.max(1, parseInt(garmentData.warmth) || 3))
      if (!Array.isArray(garmentData.season)) garmentData.season = []
      if (!Array.isArray(garmentData.tags)) garmentData.tags = []
      garmentData.secondary_color = garmentData.secondary_color || null
      garmentData.brand = garmentData.brand || null
      garmentData.subcategory = garmentData.subcategory || null
      garmentData.pattern = garmentData.pattern || 'llis'
      garmentData.material = garmentData.material || null
      garmentData.fit = garmentData.fit || 'regular'
    } catch (e) {
      console.error('[analyze-garment] Failed to parse Gemini response:', cleanJson)
      return NextResponse.json({ error: 'Error en processar la resposta de la IA' }, { status: 500 })
    }

    return NextResponse.json(garmentData)
    
  } catch (error) {
    if (error.name === 'AbortError' || request.signal?.aborted) {
      console.log('[analyze-garment] Request aborted by client')
      return new Response(null, { status: 499 })
    }

    console.error('[analyze-garment] Error:', error.message)

    const msg = error.message || ''

    // Timeout
    if (msg.includes('timeout')) {
      return NextResponse.json(
        { error: 'La connexió amb la IA ha trigat massa. Torna-ho a provar.' },
        { status: 504 }
      )
    }

    // Quota / rate-limit errors from the Gemini API
    if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
      return NextResponse.json(
        { error: 'El servei d\'IA està temporalment saturat. Torna-ho a provar d\'aquí uns minuts.' },
        { status: 429 }
      )
    }
    
    // API key issues
    if (msg.includes('API_KEY') || msg.includes('API key') || msg.includes('401') || msg.includes('403')) {
      return NextResponse.json(
        { error: 'Error de configuració del servei d\'IA.' },
        { status: 500 }
      )
    }

    // Body size / parsing issues  
    if (msg.includes('body') || msg.includes('size') || msg.includes('too large')) {
      return NextResponse.json(
        { error: 'La imatge és massa gran. Intenta amb una foto més petita.' },
        { status: 413 }
      )
    }

    return NextResponse.json({ error: 'Error intern del servidor' }, { status: 500 })
  }
}
