'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { saveGarment } from './actions'
import useAppStore from '@/store/useAppStore'
import UpgradeModal from '@/components/UpgradeModal'
import { AlertTriangle, CameraOff, Image as ImageIcon, Check } from 'lucide-react'
import CustomSelect from '@/components/CustomSelect'

const CATEGORY_OPTIONS = [
  { value: 'samarreta', label: 'Samarreta' },
  { value: 'camisa', label: 'Camisa' },
  { value: 'punt', label: 'Punt / Jersei' },
  { value: 'dessuadora', label: 'Dessuadora' },
  { value: 'jaqueta', label: 'Jaqueta / Abric' },
  { value: 'pantalons', label: 'Pantalons' },
  { value: 'vestit', label: 'Vestit' },
  { value: 'sabates', label: 'Sabates' },
  { value: 'accessori', label: 'Accessori' },
  { value: 'altres', label: 'Altres' }
]

const PATTERN_OPTIONS = [
  { value: 'llis', label: 'Llis' },
  { value: 'logo_grafic', label: 'Logo / Gràfic' },
  { value: 'ratlles', label: 'Ratlles' },
  { value: 'quadres', label: 'Quadres' },
  { value: 'floral', label: 'Floral' },
  { value: 'estampat', label: 'Estampat' },
  { value: 'geomètric', label: 'Geomètric' },
  { value: 'animal_print', label: 'Animal Print' },
  { value: 'degradat', label: 'Degradat' },
  { value: 'color_block', label: 'Color Block' },
  { value: 'paisley', label: 'Paisley' },
  { value: 'tie_dye', label: 'Tie-dye' },
  { value: 'textura', label: 'Textura' },
  { value: 'altres', label: 'Altres' }
]

const MATERIAL_OPTIONS = [
  { value: '', label: 'Desconegut' },
  { value: 'cotó', label: 'Cotó' },
  { value: 'polièster', label: 'Polièster' },
  { value: 'llana', label: 'Llana' },
  { value: 'denim', label: 'Denim' },
  { value: 'cuir', label: 'Cuir' },
  { value: 'lli', label: 'Lli' },
  { value: 'seda', label: 'Seda' },
  { value: 'niló', label: 'Niló' },
  { value: 'punt', label: 'Punt' },
  { value: 'felpa', label: 'Felpa' },
  { value: 'teixit_tècnic', label: 'Teixit tècnic' },
  { value: 'altres', label: 'Altres' }
]

const FIT_OPTIONS = [
  { value: 'ajustat', label: 'Ajustat (Slim)' },
  { value: 'regular', label: 'Regular' },
  { value: 'oversized', label: 'Oversized' },
  { value: 'crop', label: 'Crop / Curt' },
  { value: 'ample', label: 'Ample (Baggy)' }
]

export default function Afegir() {
  const addGarment = useAppStore(s => s.addGarment)
  const draftGarment = useAppStore(s => s.draftGarment)
  const clearDraftGarment = useAppStore(s => s.clearDraftGarment)

  // States: 'idle' | 'captured' | 'analyzing' | 'review' | 'saving' | 'done'
  const [state, setState] = useState('idle')
  const [photo, setPhoto] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)
  const [hasCameraError, setHasCameraError] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState('garments')

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)
  const abortControllerRef = useRef(null)
  const analysisRequestIdRef = useRef(0)

  // Track state for unmount auto-save
  const stateRef = useRef(state)
  const photoRef = useRef(photo)
  const analysisRef = useRef(analysis)

  useEffect(() => {
    stateRef.current = state
    photoRef.current = photo
    analysisRef.current = analysis
  }, [state, photo, analysis])

  useEffect(() => {
    return () => {
      // Abortar si hi ha petició activa al desmuntar
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
      // Només guardem draft si estem en 'review' (l'anàlisi ja ha acabat).
      // No guardem en 'analyzing' perquè analysis seria null (fetch en vol).
      // No guardem en 'saving' per evitar borradors fantasma d'una peça ja guardada.
      // Usem getState() directament perquè dins d'un cleanup
      // els hooks de subscripció ja no funcionen (component desmuntat).
      if (stateRef.current === 'review') {
        useAppStore.getState().setDraftGarment({
          photo: photoRef.current,
          analysis: analysisRef.current,
          state: 'review',
          timestamp: Date.now()
        })
      }
    }
  }, [])

  const handleRestoreDraft = () => {
    if (draftGarment) {
      setPhoto(draftGarment.photo)
      setAnalysis(draftGarment.analysis || {
        category: 'altres', subcategory: null, color: '', secondary_color: null,
        pattern: 'llis', material: null, formality: 3, warmth: 3,
        fit: 'regular', season: [], brand: null, description: '', tags: []
      })
      // Sempre restaurem a 'review' — és l'únic estat vàlid per un borrador
      setState('review')
      clearDraftGarment()
    }
  }

  const handleDiscardDraft = () => {
    clearDraftGarment()
  }

  // Start camera when entering 'idle' state
  useEffect(() => {
    if (state === 'idle' && !hasCameraError) {
      startCamera()
    }
    return () => stopCamera()
  }, [state, hasCameraError])

  const startCamera = async () => {
    try {
      setHasCameraError(false)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported or requires HTTPS')
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (err) {
      console.error('Camera error:', err)
      setHasCameraError(true)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current) return

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    const MAX_WIDTH = 800
    const scale = Math.min(1, MAX_WIDTH / video.videoWidth)

    canvas.width = video.videoWidth * scale
    canvas.height = video.videoHeight * scale

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setPhoto(dataUrl)
    stopCamera()
    setState('captured')
    analyzePhoto(dataUrl)
  }

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const img = new window.Image()
      const objectUrl = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 800
        const scale = Math.min(1, MAX_WIDTH / img.width)

        canvas.width = img.width * scale
        canvas.height = img.height * scale

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        URL.revokeObjectURL(objectUrl)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = objectUrl
    })
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    compressImage(file).then((dataUrl) => {
      setPhoto(dataUrl)
      stopCamera()
      setState('captured')
      analyzePhoto(dataUrl)
    })
  }

  const analyzePhoto = async (dataUrl) => {
    setState('analyzing')
    setError(null)

    // Abortar si hi ha petició activa
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller
    const currentRequestId = ++analysisRequestIdRef.current

    try {
      const res = await fetch('/api/analyze-garment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
        signal: controller.signal
      })

      if (analysisRequestIdRef.current !== currentRequestId) return

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Error analitzant la imatge')

      setAnalysis(data)
      setState('review')
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('[analyze] Request cancelled by user')
        return
      }

      if (analysisRequestIdRef.current !== currentRequestId) return

      console.error('Analysis error:', err)
      setError(err.message)
      setAnalysis({
        category: 'altres', subcategory: null, color: '', secondary_color: null,
        pattern: 'llis', material: null, formality: 3, warmth: 3,
        fit: 'regular', season: [], brand: null, description: '', tags: []
      })
      setState('review')
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null
      }
    }
  }

  const cancelAnalysis = () => {
    // Invalidar qualsevol resposta en trànsit incrementant el requestId
    analysisRequestIdRef.current++
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setPhoto(null)
    setAnalysis(null)
    setError(null)
    setState('idle')
  }

  const handleSave = async () => {
    setState('saving')
    setError(null)

    const result = await saveGarment({
      image: photo,
      ...analysis
    })

    if (result.error) {
      if (result.upgrade) {
        setUpgradeReason(result.reason || 'garments')
        setShowUpgradeModal(true)
      } else {
        setError(result.error)
      }
      setState('review')
    } else {
      if (result.garment) addGarment(result.garment)
      clearDraftGarment()
      setState('done')
    }
  }

  const reset = () => {
    // Invalidar qualsevol resposta en trànsit
    analysisRequestIdRef.current++
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setPhoto(null)
    setAnalysis(null)
    setError(null)
    setState('idle')
    clearDraftGarment()
  }

  const updateAnalysis = (field, value) => {
    setAnalysis(prev => ({ ...prev, [field]: value }))
  }

  const handleSeasonToggle = (s) => {
    setAnalysis(prev => {
      const seasons = prev.season || []
      return {
        ...prev,
        season: seasons.includes(s) ? seasons.filter(x => x !== s) : [...seasons, s]
      }
    })
  }

  const handleTagToggle = (tag) => {
    setAnalysis(prev => {
      const tags = prev.tags || []
      if (tags.includes(tag)) {
        return { ...prev, tags: tags.filter(t => t !== tag) }
      }
      return { ...prev, tags: [...tags, tag] }
    })
  }

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault()
      const newTag = e.target.value.trim().toLowerCase()
      if (!analysis.tags?.includes(newTag)) {
        updateAnalysis('tags', [...(analysis.tags || []), newTag])
      }
      e.target.value = ''
    }
  }

  return (
    <>
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} reason={upgradeReason} />
    <div className="flex flex-col h-full flex-1 relative">

        {/* ERROR MESSAGE */}
        {error && (
          <div className="absolute top-16 left-4 right-4 z-40 p-3 rounded-xl glass border-red-500/20 text-red-400 flex items-start gap-2.5 text-xs">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* DRAFT BANNER */}
        {draftGarment && state === 'idle' && (
          <div className="absolute top-4 left-4 right-4 z-40 p-4 rounded-xl glass-strong border border-brand-accent/30 flex flex-col gap-3 shadow-lg animate-[fadeInDown_0.4s_ease-out]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0">
                {draftGarment.photo ? (
                  <Image src={draftGarment.photo} alt="Draft" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <ImageIcon size={20} className="text-zinc-500" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-[var(--theme-text-primary)]">Tens un esborrany pendent</h3>
                <p className="text-xs text-[var(--theme-text-secondary)] mt-0.5">S'ha guardat automàticament la teva última peça.</p>
              </div>
            </div>
            <div className="flex gap-2 mt-1">
              <button 
                onClick={handleDiscardDraft}
                className="flex-1 py-2 text-xs font-medium rounded-lg glass-subtle text-[var(--theme-text-secondary)] hover:text-white transition-colors duration-200"
              >
                Descartar
              </button>
              <button 
                onClick={handleRestoreDraft}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-brand-accent/20 text-brand-accent border border-brand-accent/30 hover:bg-brand-accent/30 transition-colors duration-200"
              >
                Restaurar
              </button>
            </div>
          </div>
        )}

        {/* STATE: IDLE (CAMERA) */}
        {state === 'idle' && (
          <div className="flex-1 bg-black rounded-[20px] overflow-hidden relative flex items-center justify-center">
            {!hasCameraError ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 z-10 relative">
                <CameraOff size={40} className="mb-3 text-[var(--theme-text-muted)]" />
                <p className="text-sm text-[var(--theme-text-secondary)] mb-4">No s'ha pogut accedir a la càmera.</p>
                <button
                  className="glass rounded-xl px-5 py-2.5 font-semibold text-sm text-[var(--theme-text-primary)] transition-all duration-300 hover:bg-[var(--theme-hover)]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Pujar foto
                </button>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />

            {!hasCameraError && (
              <>
                {/* Corner brackets — iOS style */}
                <div className="absolute inset-8 z-10 pointer-events-none">
                  {/* Top-left */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/40 rounded-tl-lg" />
                  {/* Top-right */}
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/40 rounded-tr-lg" />
                  {/* Bottom-left */}
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/40 rounded-bl-lg" />
                  {/* Bottom-right */}
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/40 rounded-br-lg" />
                </div>

                <p className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-white/40 z-10 pointer-events-none">Apunta la càmera a la roba</p>

                {/* Camera controls */}
                <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-10 z-20">
                  <button
                    className="w-10 h-10 rounded-full glass flex items-center justify-center text-white text-sm transition-all duration-300 hover:bg-white/[0.15]"
                    aria-label="Galeria"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon size={20} />
                  </button>
                  <button
                    className="w-[72px] h-[72px] rounded-full bg-transparent border-[3px] border-white/80 p-1 flex items-center justify-center transition-transform duration-200 hover:scale-95 active:scale-90 group"
                    aria-label="Fer foto"
                    onClick={capturePhoto}
                  >
                    <div className="w-full h-full bg-white rounded-full transition-colors duration-150 group-active:bg-zinc-300" />
                  </button>
                  <div className="w-10 h-10 invisible" />
                </div>
              </>
            )}
          </div>
        )}

        {/* STATE: ANALYZING */}
        {state === 'analyzing' && (
          <div className="flex-1 rounded-[20px] overflow-hidden relative">
            <Image src={photo} alt="Captured" fill className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px] flex flex-col items-center justify-center text-white z-10 transition-all duration-500">
              
              {/* High-tech AI Scanning Viewfinder */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 mb-8 z-20">
                {/* Viewfinder brackets */}
                <div className="absolute top-0 left-0 w-10 h-10 border-t-[3px] border-l-[3px] border-brand-accent rounded-tl-2xl animate-[pulseGlow_2s_ease-in-out_infinite]" />
                <div className="absolute top-0 right-0 w-10 h-10 border-t-[3px] border-r-[3px] border-brand-accent rounded-tr-2xl animate-[pulseGlow_2s_ease-in-out_infinite_0.5s]" />
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-[3px] border-l-[3px] border-brand-accent rounded-bl-2xl animate-[pulseGlow_2s_ease-in-out_infinite_1s]" />
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-[3px] border-r-[3px] border-brand-accent rounded-br-2xl animate-[pulseGlow_2s_ease-in-out_infinite_1.5s]" />
                
                {/* The Scanning Box */}
                <div className="absolute inset-4 border border-white/10 rounded-xl overflow-hidden glass-subtle">
                  {/* Grid background */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:16px_16px] opacity-60" />
                  
                  {/* Moving glowing line container */}
                  <div className="absolute left-0 right-0 h-32 animate-[aiScanLine_2s_ease-in-out_infinite_alternate] -mt-32">
                    {/* The glowing line itself (at the bottom of the tail) */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-accent shadow-[0_0_15px_3px_var(--color-brand-accent)]" />
                    {/* Glowing gradient tail */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-accent/40 to-transparent" />
                  </div>
                  
                  {/* Data analysis points (simulate AI finding features) */}
                  <div className="absolute top-[20%] left-[30%] w-1.5 h-1.5 rounded-full bg-brand-primary text-brand-primary animate-[dataPoint_1.5s_infinite_0.2s]" />
                  <div className="absolute top-[60%] right-[25%] w-1.5 h-1.5 rounded-full bg-brand-secondary text-brand-secondary animate-[dataPoint_2s_infinite_0.7s]" />
                  <div className="absolute bottom-[25%] left-[40%] w-1.5 h-1.5 rounded-full bg-brand-accent text-brand-accent animate-[dataPoint_1.8s_infinite_1.2s]" />
                  <div className="absolute top-[40%] right-[40%] w-1.5 h-1.5 rounded-full bg-white text-white animate-[dataPoint_1.6s_infinite_0.9s]" />
                </div>
              </div>
              
              {/* Text Badge */}
              <div className="z-20 glass-strong px-6 py-3 rounded-full flex items-center gap-3 animate-[fadeInUp_0.5s_ease-out]">
                <div className="w-4 h-4 rounded-full border-2 border-brand-accent border-t-transparent animate-spin" />
                <p className="font-semibold text-sm tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent">
                  Analitzant peça amb IA
                  <span className="inline-flex ml-1 text-brand-accent">
                    <span className="animate-[dotPulse_1.4s_ease-in-out_infinite]">.</span>
                    <span className="animate-[dotPulse_1.4s_ease-in-out_0.2s_infinite]">.</span>
                    <span className="animate-[dotPulse_1.4s_ease-in-out_0.4s_infinite]">.</span>
                  </span>
                </p>
              </div>

              {/* Cancel button */}
              <button
                onClick={cancelAnalysis}
                className="z-20 mt-4 px-6 py-2.5 rounded-full glass-strong text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 active:scale-95 animate-[fadeInUp_0.5s_ease-out_0.3s_both]"
              >
                Cancel·lar anàlisi
              </button>
            </div>
          </div>
        )}

        {/* STATE: REVIEW */}
        {(state === 'review' || state === 'saving') && analysis && (
          <div className="flex flex-col gap-3 overflow-y-auto pb-4 hide-scrollbar h-full animate-[fadeIn_0.3s_ease-out]">
            {/* Photo preview — compact for mobile */}
            <div className="relative w-full aspect-[4/3] rounded-[20px] overflow-hidden shrink-0">
              <Image src={photo} alt="Preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
            </div>

            {/* Analysis form */}
            <div className="glass rounded-[20px] p-5 flex-1 flex flex-col">
              <h2 className="text-base font-semibold mb-4 text-[var(--theme-text-primary)]">Resultats de l'anàlisi</h2>

              <div className="flex flex-col gap-3.5">
                {/* Fila 1 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Categoria</label>
                    <CustomSelect
                      options={CATEGORY_OPTIONS}
                      value={analysis.category || 'altres'}
                      onChange={(val) => updateAnalysis('category', val)}
                      disabled={state === 'saving'}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Subcategoria</label>
                    <input
                      type="text"
                      className="w-full glass-subtle rounded-xl py-2.5 px-3.5 text-sm text-[var(--theme-text-primary)] focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all duration-300 placeholder:text-[var(--theme-text-muted)]"
                      value={analysis.subcategory || ''}
                      onChange={(e) => updateAnalysis('subcategory', e.target.value)}
                      disabled={state === 'saving'}
                      placeholder="Ex: Polo, Hoodie..."
                    />
                  </div>
                </div>

                {/* Fila 2 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Color Principal</label>
                    <input
                      type="text"
                      className="w-full glass-subtle rounded-xl py-2.5 px-3.5 text-sm text-[var(--theme-text-primary)] focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all duration-300 placeholder:text-[var(--theme-text-muted)]"
                      value={analysis.color || ''}
                      onChange={(e) => updateAnalysis('color', e.target.value)}
                      disabled={state === 'saving'}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Color Secundari</label>
                    <input
                      type="text"
                      className="w-full glass-subtle rounded-xl py-2.5 px-3.5 text-sm text-[var(--theme-text-primary)] focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all duration-300 placeholder:text-[var(--theme-text-muted)]"
                      value={analysis.secondary_color || ''}
                      onChange={(e) => updateAnalysis('secondary_color', e.target.value)}
                      disabled={state === 'saving'}
                      placeholder="Opcional"
                    />
                  </div>
                </div>

                {/* Fila 3 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Patró</label>
                    <CustomSelect
                      options={PATTERN_OPTIONS}
                      value={analysis.pattern || 'llis'}
                      onChange={(val) => updateAnalysis('pattern', val)}
                      disabled={state === 'saving'}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Material</label>
                    <CustomSelect
                      options={MATERIAL_OPTIONS}
                      value={analysis.material || ''}
                      onChange={(val) => updateAnalysis('material', val)}
                      disabled={state === 'saving'}
                    />
                  </div>
                </div>

                {/* Fila 4 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Formalitat</label>
                      <span className="text-[10px] text-brand-primary font-medium">
                        {['Molt informal', 'Informal', 'Neutre', 'Formal', 'Molt formal'][(analysis.formality || 3) - 1]}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1" max="5"
                      className="w-full accent-brand-primary"
                      value={analysis.formality || 3}
                      onChange={(e) => updateAnalysis('formality', parseInt(e.target.value))}
                      disabled={state === 'saving'}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Calidesa</label>
                      <span className="text-[10px] text-orange-400 font-medium">
                        {['Molt fresc', 'Fresc', 'Neutre', 'Càlid', 'Molt càlid'][(analysis.warmth || 3) - 1]}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1" max="5"
                      className="w-full accent-orange-400"
                      value={analysis.warmth || 3}
                      onChange={(e) => updateAnalysis('warmth', parseInt(e.target.value))}
                      disabled={state === 'saving'}
                    />
                  </div>
                </div>

                {/* Fila 5 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Fit / Tallatge</label>
                    <CustomSelect
                      options={FIT_OPTIONS}
                      value={analysis.fit || 'regular'}
                      onChange={(val) => updateAnalysis('fit', val)}
                      disabled={state === 'saving'}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Marca</label>
                    <input
                      type="text"
                      className="w-full glass-subtle rounded-xl py-2.5 px-3.5 text-sm text-[var(--theme-text-primary)] focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all duration-300 placeholder:text-[var(--theme-text-muted)]"
                      value={analysis.brand || ''}
                      onChange={(e) => updateAnalysis('brand', e.target.value)}
                      disabled={state === 'saving'}
                      placeholder="Opcional"
                    />
                  </div>
                </div>

                {/* Fila 6 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Temporades Recomanades</label>
                  <div className="flex gap-2">
                    {['primavera', 'estiu', 'tardor', 'hivern'].map(s => {
                      const isActive = (analysis.season || []).includes(s)
                      return (
                        <button
                          key={s}
                          type="button"
                          disabled={state === 'saving'}
                          onClick={() => handleSeasonToggle(s)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-300 ${isActive ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30' : 'glass-subtle text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-hover)]'}`}
                        >
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Fila 7 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Descripció</label>
                  <textarea
                    className="w-full glass-subtle rounded-xl py-2.5 px-3.5 text-sm text-[var(--theme-text-primary)] focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all duration-300 placeholder:text-[var(--theme-text-muted)] resize-none"
                    value={analysis.description || ''}
                    onChange={(e) => updateAnalysis('description', e.target.value)}
                    rows={2}
                    disabled={state === 'saving'}
                  />
                </div>

                {/* Fila 8 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Tags Extras</label>
                  <div className="flex flex-wrap gap-1.5 p-2.5 glass-subtle rounded-xl">
                    {analysis.tags?.map(tag => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--theme-glass-highlight)] text-[var(--theme-text-primary)] text-xs font-medium cursor-pointer hover:bg-[var(--theme-hover)] transition-colors duration-200"
                        onClick={() => state !== 'saving' && handleTagToggle(tag)}
                      >
                        {tag} <span className="text-[var(--theme-text-muted)] text-[10px]">✕</span>
                      </span>
                    ))}
                    <input
                      type="text"
                      className="flex-1 min-w-[100px] bg-transparent border-none text-[var(--theme-text-primary)] focus:outline-none text-xs px-1.5 py-1 placeholder:text-[var(--theme-text-muted)]"
                      placeholder="Afegir tag..."
                      onKeyDown={handleAddTag}
                      disabled={state === 'saving'}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 flex gap-2.5">
                <button
                  className="flex-1 py-3 rounded-xl font-semibold text-sm glass text-[var(--theme-text-primary)] hover:bg-[var(--theme-hover)] transition-all duration-300"
                  onClick={reset}
                  disabled={state === 'saving'}
                >
                  Repetir
                </button>
                <button
                  className="flex-[2] py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-app-primary to-brand-secondary text-white shadow-[0_4px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_25px_rgba(124,58,237,0.4)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
                  onClick={handleSave}
                  disabled={state === 'saving'}
                >
                  {state === 'saving' ? <><span className="w-4 h-4 css-spinner" /> Guardant...</> : state === 'success' ? <><Check size={16} /> Guardat!</> : 'Guardar Peça'}
                </button>
              </div>
            </div>
          </div>
        )}

        {state === 'done' && (
          <div className="flex flex-col items-center justify-center flex-1 min-h-[75vh] h-full text-center p-6 animate-[scaleIn_0.4s_ease-out]">
            <div className="w-20 h-20 glass text-brand-accent rounded-full flex items-center justify-center mb-6 glow-accent">
              <Check size={40} />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-[var(--theme-text-primary)]">Peça guardada!</h2>
            <p className="text-sm text-[var(--theme-text-secondary)] mb-12 max-w-[260px]">La peça s'ha afegit correctament al teu armari intel·ligent.</p>

            <div className="flex flex-col gap-3 w-full max-w-sm">
              <button
                className="w-full py-4 rounded-xl font-semibold text-[15px] bg-gradient-to-r from-app-primary to-brand-secondary text-white shadow-[0_4px_20px_rgba(124,58,237,0.3)] transition-all duration-300 hover:shadow-[0_6px_25px_rgba(124,58,237,0.4)] active:scale-[0.98]"
                onClick={reset}
              >
                Escanejar una altra peça
              </button>
              <Link
                href="/app/armari"
                className="w-full py-4 rounded-xl font-semibold text-[15px] glass text-center text-[var(--theme-text-primary)] hover:bg-[var(--theme-hover)] transition-all duration-300 active:scale-[0.98]"
              >
                Veure el meu armari
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
