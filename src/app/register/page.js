'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Check } from 'lucide-react'
import Image from 'next/image'
import { register } from '@/app/auth/actions'
import SubmitButton from '@/components/SubmitButton'

export default function RegisterPage() {
  const [state, formAction] = useActionState(register, null)

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--theme-bg)] text-[var(--theme-text-primary)] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-primary/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-secondary/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/" className="flex items-center">
            <Image src="/logoEnteroBlanco.svg" alt="thelook" width={130} height={52} priority className="opacity-90 logo-white" />
            <Image src="/logoEntero.svg" alt="thelook" width={130} height={52} priority className="opacity-90 logo-black" />
          </Link>
        </div>

        {/* Card */}
        <div className="w-full glass p-7 sm:p-9 rounded-2xl">
          <div className="text-center mb-7">
            <h1 className="text-2xl font-semibold mb-1.5">Crea el teu compte</h1>
            <p className="text-sm text-[var(--theme-text-secondary)]">Comença a organitzar el teu armari</p>
          </div>

          {state?.error && (
            <div className="mb-6 p-4 rounded-xl glass-subtle border-red-500/20 text-red-400 text-sm flex items-start gap-3">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          {state?.success && (
            <div className="mb-6 p-4 rounded-xl glass-subtle border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-3">
              <Check size={18} className="shrink-0 mt-0.5" />
              <span>{state.success}</span>
            </div>
          )}

          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider" htmlFor="name">Nom</label>
              <input
                id="name"
                name="name"
                type="text"
                className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-glass-border)] rounded-xl py-2.5 px-3.5 text-sm text-[var(--theme-text-primary)] focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all duration-300 placeholder:text-[var(--theme-text-muted)]"
                placeholder="El teu nom"
                required
                autoComplete="name"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-glass-border)] rounded-xl py-2.5 px-3.5 text-sm text-[var(--theme-text-primary)] focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all duration-300 placeholder:text-[var(--theme-text-muted)]"
                placeholder="hola@exemple.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider" htmlFor="password">Contrasenya</label>
              <input
                id="password"
                name="password"
                type="password"
                className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-glass-border)] rounded-xl py-2.5 px-3.5 text-sm text-[var(--theme-text-primary)] focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all duration-300 placeholder:text-[var(--theme-text-muted)]"
                placeholder="Mínim 8 caràcters"
                required
                autoComplete="new-password"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider" htmlFor="confirm">Confirma la contrasenya</label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-glass-border)] rounded-xl py-2.5 px-3.5 text-sm text-[var(--theme-text-primary)] focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all duration-300 placeholder:text-[var(--theme-text-muted)]"
                placeholder="Repeteix la contrasenya"
                required
                autoComplete="new-password"
              />
            </div>

            <div className="mt-1">
              <SubmitButton text="Crear compte" />
            </div>
          </form>

          <div className="relative my-7 flex items-center justify-center">
            <div className="absolute inset-x-0 h-px bg-[var(--theme-border)]" />
            <span className="relative glass-subtle px-3 py-0.5 rounded-full text-[10px] text-[var(--theme-text-secondary)]">o</span>
          </div>

          <p className="text-center text-xs text-[var(--theme-text-secondary)]">
            Ja tens compte?{' '}
            <Link href="/login" className="font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors duration-300">Inicia sessió</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
