'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export default function CustomSelect({ options, value, onChange, className = '', disabled = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Find the label for the current value
  const currentOption = options.find(opt => typeof opt === 'object' ? opt.value === value : opt === value);
  const displayLabel = typeof currentOption === 'object' ? currentOption.label : (currentOption || value);

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        disabled={disabled}
        className={`w-full glass-subtle rounded-xl px-3 py-2.5 text-sm flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all duration-300 ${disabled ? 'opacity-60 cursor-not-allowed text-[var(--theme-text-muted)]' : 'text-[var(--theme-text-primary)]'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="truncate capitalize">{displayLabel}</span>
        <ChevronDown size={16} className={`text-[var(--theme-text-muted)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xl overflow-hidden shadow-xl animate-[fadeIn_0.15s_ease-out] max-h-60 overflow-y-auto hide-scrollbar">
          {options.map((opt, i) => {
            const optValue = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <div
                key={optValue || i}
                className={`px-3 py-2.5 text-sm cursor-pointer transition-colors duration-200 capitalize ${
                  value === optValue 
                    ? 'bg-brand-primary/20 text-brand-primary font-semibold' 
                    : 'text-[var(--theme-text-primary)] hover:bg-[var(--theme-hover)]'
                }`}
                onClick={() => {
                  onChange(optValue)
                  setIsOpen(false)
                }}
              >
                {optLabel}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
