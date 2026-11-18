'use client'

import { useWeather } from '@/hooks/useWeather'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, RefreshCw, Droplets, Wind, Crosshair, ArrowRight, Loader2, CloudRain, Snowflake, Sun, Shirt, Sparkles } from 'lucide-react'

export default function WeatherWidget() {
  const { weather, isLoading, error, source, permissionState, refreshWeather, requestLocation } = useWeather()

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-4 animate-pulse">
        <div className="flex gap-3 items-center">
          <div className="w-12 h-12 bg-[var(--theme-glass-bg)] rounded-xl shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-3 bg-[var(--theme-glass-bg)] rounded w-2/3" />
            <div className="h-2.5 bg-[var(--theme-glass-bg)] rounded w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  if (error && !weather) {
    return (
      <div className="glass rounded-2xl p-4 flex flex-col gap-2 items-center justify-center text-center border-red-500/20">
        <p className="text-xs text-red-400">{error}</p>
        <button 
          onClick={refreshWeather}
          className="glass-subtle text-[var(--theme-text-primary)] font-semibold py-1.5 px-3 rounded-lg text-xs hover:bg-[var(--theme-hover)] transition-all duration-300 flex items-center gap-1.5"
        >
          <RefreshCw size={12} className="mr-1" /> Reintentar
        </button>
      </div>
    )
  }

  if (!weather) return null

  // Background gradient based on weather
  let bgGradient = "from-blue-900/20 to-transparent"
  switch (weather.weatherMain) {
    case 'Clear': bgGradient = "from-amber-500/10 to-transparent"; break;
    case 'Rain': case 'Drizzle': bgGradient = "from-blue-600/10 to-transparent"; break;
    case 'Thunderstorm': bgGradient = "from-purple-900/15 to-transparent"; break;
    case 'Snow': bgGradient = "from-slate-300/10 to-transparent"; break;
  }

  return (
    <div className={`glass rounded-2xl p-4 relative overflow-hidden transition-all duration-500`}>
      {/* Subtle weather background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} pointer-events-none`} />
      
      <div className="relative z-10">
        {/* Location + Refresh */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--theme-text-secondary)]">
            <MapPin size={12} className="text-brand-accent mr-1" />
            {weather.cityName}{weather.country ? `, ${weather.country}` : ''}
            {source !== 'gps' && <span className="opacity-50">(aprox)</span>}
          </div>
          <button onClick={refreshWeather} className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors duration-300 p-1">
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          </button>
        </div>

        {/* Main weather info — compact */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 relative shrink-0">
            <Image 
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} 
              alt={weather.description}
              fill
              className="object-contain drop-shadow-lg"
              sizes="48px"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-semibold tracking-tighter leading-none text-[var(--theme-text-primary)]">{weather.temp}°</span>
            <span className="text-xs text-[var(--theme-text-secondary)] capitalize mt-0.5">{weather.description}</span>
          </div>
          
          <div className="w-px h-8 bg-[var(--theme-glass-border)] mx-1" />
          
          <div className="flex flex-col gap-1 text-[10px] text-[var(--theme-text-muted)] font-medium flex-1">
            <div className="flex justify-between">
              <span>Sensació</span>
              <span className="text-[var(--theme-text-primary)]">{weather.feels_like}°</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1"><Droplets size={12} className="text-blue-400/70" />Hum.</span>
              <span className="text-[var(--theme-text-primary)]">{weather.humidity}%</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1"><Wind size={12} className="text-teal-400/70" />Vent</span>
              <span className="text-[var(--theme-text-primary)]">{weather.wind_speed} km/h</span>
            </div>
          </div>
        </div>
        
        {/* CTA + GPS hint */}
        <div className="mt-3 flex flex-col gap-2">
          <Link 
            href="/app/armari" 
            className="flex items-center justify-between glass-subtle rounded-xl p-2.5 text-xs font-semibold transition-all duration-300 hover:bg-[var(--theme-hover)] text-[var(--theme-text-primary)]"
          >
            <span>
              {weather.weatherCategory === 'Pluja' || weather.weatherCategory === 'Tempesta' 
                ? <><CloudRain size={16} className="inline-block mr-1.5 text-blue-400" /> Dia de pluja! Outfit impermeable</> 
                : weather.weatherCategory === 'Neu' 
                ? <><Snowflake size={16} className="inline-block mr-1.5 text-blue-200" /> Neu! Abriga't bé</>
                : weather.temp >= 28 
                ? <><Sun size={16} className="inline-block mr-1.5 text-yellow-400" /> Fa calor! Outfit fresc</> 
                : weather.temp <= 12 
                ? <><Shirt size={16} className="inline-block mr-1.5 text-[var(--theme-text-primary)]" /> Fa fred! Outfit d'abric</> 
                : <><Sparkles size={16} className="inline-block mr-1.5 text-brand-primary" /> Genera un outfit per a avui</>}
            </span>
            <ArrowRight size={14} className="text-[var(--theme-text-muted)]" />
          </Link>
          
          {source !== 'gps' && permissionState === 'prompt' && (
            <button 
              onClick={requestLocation}
              className="text-[9px] glass-subtle text-[var(--theme-text-secondary)] hover:text-brand-accent rounded-lg p-2 text-center uppercase tracking-wider font-semibold transition-all duration-300 flex items-center justify-center gap-1.5"
            >
              <Crosshair size={12} className="mr-1" /> Activa GPS per temps exacte
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
