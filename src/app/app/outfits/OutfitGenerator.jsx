'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { saveOutfit } from './outfit-actions'
import useAppStore from '@/store/useAppStore'

import UpgradeModal from '@/components/UpgradeModal'
import { AlertTriangle, Sparkles, Pencil, Bot, ChevronDown, ChevronUp } from 'lucide-react'
import { useWeather } from '@/hooks/useWeather'
import CustomSelect from '@/components/CustomSelect'

import OutfitLoadingOverlay from './OutfitLoadingOverlay'
import OutfitReveal from './OutfitReveal'

import { OCCASIONS, STYLES, MANUAL_WEATHERS } from './constants'

export default function OutfitGenerator() {
  const garments = useAppStore(s => s.garments)
  const { weather: autoWeather, isLoading: isLoadingWeather } = useWeather()
  const [occasion, setOccasion] = useState('Casual')
  const [style, setStyle] = useState('No ho tinc clar')
  const [manualWeather, setManualWeather] = useState('Assolellat')
  const [manualWeatherToggle, setManualWeatherToggle] = useState(false)
  const useManualWeather = (!isLoadingWeather && !autoWeather) || manualWeatherToggle
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState('outfits')
  
  // Collapse form state when outfit is generated
  const [isFormCollapsed, setIsFormCollapsed] = useState(false)

  const hasEnoughGarments = garments && garments.length >= 2

  // Force minimum loading time to show cinematic animation
  const handleGenerate = async () => {
    const prevIds = result?.garment_ids || null
    setIsLoading(true)
    setError(null)
    setSaveSuccess(false)
    setIsFormCollapsed(true) // Auto collapse form

    const startTime = Date.now()

    try {
      const payload = { 
        occasion,
        style: style === 'No ho tinc clar' ? null : style,
        weather: useManualWeather ? manualWeather : autoWeather?.weatherCategory,
        weatherData: useManualWeather ? null : autoWeather,
        previousCombination: prevIds,
        clientHour: new Date().getHours()
      }

      const response = await fetch('/api/generate-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.upgrade) {
          setUpgradeReason(data.reason || 'outfits')
          setShowUpgradeModal(true)
          setIsFormCollapsed(false) // Expand form back on error
          return
        }
        throw new Error(data.error || 'Error al generar outfit')
      }

      const outfitGarments = data.garment_ids.map(id => 
        garments.find(g => g.id === id)
      ).filter(Boolean)

      // Calculate elapsed time and sleep if necessary to guarantee the loading overlay is enjoyed
      const elapsedTime = Date.now() - startTime
      const minLoadingTime = 2500 // 2.5 seconds
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime))
      }

      setResult({
        ...data,
        garments: outfitGarments
      })
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    } catch (err) {
      setError(err.message)
      setIsFormCollapsed(false) // Expand form back on error
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!result) return
    setIsSaving(true)

    const res = await saveOutfit({
      garment_ids: result.garment_ids,
      occasion,
      weather: useManualWeather ? manualWeather : autoWeather?.weatherCategory,
      style: style === 'No ho tinc clar' ? null : style,
      explanation: result.explanation,
      style_tip: result.style_tip,
      match_score: result.match_score
    })

    if (res.success) {
      if (res.outfit) {
        useAppStore.getState().addOutfit(res.outfit)
      }
      setSaveSuccess(true)
    } else {
      setError(res.error)
    }
    
    setIsSaving(false)
  }

  if (!hasEnoughGarments) {
    return (
      <div className="glass rounded-2xl p-5 opacity-40 grayscale mt-4">
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2"><Bot size={20} /> Genera un Outfit amb IA</h2>
        <div className="flex items-start gap-2.5 text-red-400/80 p-3 rounded-xl glass-subtle text-xs">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <p>Necessites almenys 2 peces per generar outfits amb IA.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} reason={upgradeReason} />
      
      {/* Cinematic Loading Overlay */}
      <OutfitLoadingOverlay isVisible={isLoading} />

      {/* Outfit Generator */}
      <div className="relative mt-4">
        {/* Glow behind the card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-app-primary/15 via-brand-secondary/10 to-app-accent/5 rounded-[24px] blur-xl animate-pulseGlow pointer-events-none" />
        
        <div className="relative glass-strong rounded-[22px] p-5 overflow-hidden">
          {/* Subtle decoration gradient */}
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-brand-primary/10 rounded-full blur-[50px] pointer-events-none" />

          {/* Form Header (Collapsible toggle if result exists) */}
          <div 
            className={`relative z-10 flex items-center justify-between ${result ? 'cursor-pointer select-none pb-2' : 'mb-4'}`}
            onClick={() => result && setIsFormCollapsed(!isFormCollapsed)}
          >
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Bot size={16} className="inline-block mr-0.5 text-brand-secondary" /> 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--theme-text-primary)] to-brand-accent">
                  Generador d&apos;Outfit IA
                </span>
              </h2>
              {result && isFormCollapsed && (
                <p className="text-[10px] text-[var(--theme-text-muted)] mt-0.5">
                  {occasion} · {style !== 'No ho tinc clar' ? `${style} · ` : ''}{useManualWeather ? manualWeather : autoWeather?.weatherCategory || 'Clima detectat'}
                </p>
              )}
              {!result && (
                <p className="text-[var(--theme-text-muted)] text-[11px] mt-0.5">El teu estilista personal et recomana què posar-te.</p>
              )}
            </div>
            
            {result && (
              <button className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] p-1 rounded-lg glass-subtle transition-all">
                {isFormCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
            )}
          </div>

          {/* Collapsible Form Fields */}
          <div 
            className={`relative z-10 flex flex-col gap-3.5 transition-all duration-300 ${
              isFormCollapsed ? 'max-h-0 opacity-0 overflow-hidden pointer-events-none' : 'max-h-[500px] opacity-100 mt-2'
            }`}
          >
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold tracking-wider uppercase text-[var(--theme-text-secondary)]">Ocasió</label>
                <CustomSelect 
                  options={OCCASIONS}
                  value={occasion} 
                  onChange={setOccasion}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold tracking-wider uppercase text-[var(--theme-text-secondary)]">Estil (opcional)</label>
                <CustomSelect 
                  options={STYLES}
                  value={style} 
                  onChange={setStyle}
                />
              </div>

              {useManualWeather ? (
                <div className="flex flex-col gap-1.5 col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-bold tracking-wider uppercase text-[var(--theme-text-secondary)]">Temps</label>
                    {autoWeather && (
                      <button 
                        onClick={() => setManualWeatherToggle(false)}
                        className="text-[9px] text-brand-primary hover:text-brand-secondary transition-colors duration-300 font-semibold uppercase"
                      >
                        Auto
                      </button>
                    )}
                  </div>
                  <CustomSelect 
                    options={MANUAL_WEATHERS}
                    value={manualWeather} 
                    onChange={setManualWeather}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[9px] font-bold tracking-wider uppercase text-[var(--theme-text-secondary)]">Temps Actual</label>
                  <div className="glass-subtle rounded-xl px-3 py-2 flex items-center gap-2 h-full relative group">
                    <span className="text-base">
                      {autoWeather?.icon ? (
                        <Image 
                          src={`https://openweathermap.org/img/wn/${autoWeather.icon}.png`} 
                          alt={autoWeather.description || "Temps"} 
                          width={20} 
                          height={20} 
                          className="inline-block object-contain" 
                        />
                      ) : '⛅'}
                    </span>
                    <div className="flex flex-col overflow-hidden flex-1">
                      <span className="text-xs font-semibold truncate text-[var(--theme-text-primary)]">
                        {autoWeather?.temp}° · <span className="capitalize">{autoWeather?.description}</span>
                      </span>
                      <span className="text-[9px] text-[var(--theme-text-muted)] truncate">{autoWeather?.cityName}</span>
                    </div>
                    <button 
                      onClick={() => setManualWeatherToggle(true)}
                      className="text-[var(--theme-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:text-[var(--theme-text-primary)]"
                    >
                      <Pencil size={10} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button 
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-primary via-brand-secondary to-app-primary text-white shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 hover:-translate-y-0.5" 
              onClick={handleGenerate}
              disabled={isLoading}
            >
              <Sparkles size={15} className="animate-pulse" />
              <span>Generar Outfit</span>
            </button>
          </div>

          {error && (
            <div className="mt-4 glass-subtle text-red-400 p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-[fadeInUp_0.3s_ease-out]">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Premium Outfit Reveal Component */}
          {result && (
            <OutfitReveal 
              result={result}
              garments={garments}
              onUpdateResult={setResult}
              isLoading={isLoading}
              isSaving={isSaving}
              saveSuccess={saveSuccess}
              handleSave={handleSave}
              handleGenerate={handleGenerate}
            />
          )}
        </div>
      </div>
    </>
  )
}
