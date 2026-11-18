'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { login, signup } from './actions'
import Link from 'next/link'
import { Camera, Sparkles, Cloud, AlertTriangle, Check, User, Mail, Lock, Loader2, UserPlus, LogIn, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--theme-bg)]">
        <Loader2 className="animate-spin text-brand-primary" size={32} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('next') || '/app'
  const isFromBlog = redirectTo.startsWith('/blog')

  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData) {
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (isRegister) {
        const result = await signup(formData)
        if (result?.error) {
          setError(result.error)
        } else if (result?.success) {
          setSuccess(result.success)
        }
      } else {
        const result = await login(formData)
        if (result?.error) {
          setError(result.error)
        }
      }
    } catch (e) {
      // redirect() throws NEXT_REDIRECT — this is expected
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--theme-bg)] text-[var(--theme-text-primary)]">
      {/* Left Panel — Branding */}
      <div className="hidden md:flex flex-col justify-center w-5/12 relative overflow-hidden p-12 lg:p-20">
        <div className="absolute inset-0 glass pointer-events-none" />
        <div className="absolute top-0 -left-1/4 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 -right-1/4 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center mb-16 hover:opacity-80 transition-opacity duration-300">
            <Image src="/logoEnteroBlanco.svg" alt="thelook" width={130} height={52} className="opacity-90 logo-white" />
            <Image src="/logoEntero.svg" alt="thelook" width={130} height={52} className="opacity-90 logo-black" />
          </Link>
          <h1 className="text-4xl lg:text-5xl font-semibold leading-tight mb-6">
            El teu armari,
            <br />
            <span className="text-gradient">reinventat.</span>
          </h1>
          <p className="text-[var(--theme-text-muted)] text-base mb-12 max-w-md">
            Digitalitza la teva roba i deixa que la IA
            creï els outfits perfectes per a tu.
          </p>
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 text-[var(--theme-text-muted)] font-medium text-sm">
              <div className="w-9 h-9 rounded-full glass flex items-center justify-center text-brand-primary text-sm">
                <Camera size={14} />
              </div>
              <span>Foto → Armari digital</span>
            </div>
            <div className="flex items-center gap-3 text-[var(--theme-text-muted)] font-medium text-sm">
              <div className="w-9 h-9 rounded-full glass flex items-center justify-center text-brand-secondary text-sm">
                <Sparkles size={14} />
              </div>
              <span>Outfits generats amb IA</span>
            </div>
            <div className="flex items-center gap-3 text-[var(--theme-text-muted)] font-medium text-sm">
              <div className="w-9 h-9 rounded-full glass flex items-center justify-center text-brand-accent text-sm">
                <Cloud size={14} />
              </div>
              <span>Accessible des de qualsevol lloc</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        
        <div className="md:hidden flex items-center justify-center mb-10">
          <Image src="/logoEnteroBlanco.svg" alt="thelook" width={130} height={52} className="opacity-90 logo-white" />
          <Image src="/logoEntero.svg" alt="thelook" width={130} height={52} className="opacity-90 logo-black" />
        </div>

        <div className="w-full max-w-md glass p-7 sm:p-9 rounded-2xl">
          <div className="text-center mb-7">
            <h2 className="text-2xl font-semibold mb-1.5">
              {isRegister ? 'Crea el teu compte' : 'Benvingut/da'}
            </h2>
            <p className="text-sm text-[var(--theme-text-secondary)]">
              {isRegister
                ? 'Comença a organitzar el teu armari'
                : 'Accedeix al teu armari intel·ligent'}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl glass-subtle border-red-500/10 text-red-400 flex items-start gap-2.5 text-xs">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3 rounded-xl glass-subtle border-teal-500/10 text-teal-400 flex items-start gap-2.5 text-xs">
              <Check size={18} />
              <span>{success}</span>
            </div>
          )}

          <form action={handleSubmit} className="flex flex-col gap-4">
            {/* Campo hidden para redirect post-login */}
            <input type="hidden" name="redirectTo" value={redirectTo} />
            {isRegister && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fullName" className="text-[11px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">
                  Nom complet
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]" />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    placeholder="El teu nom"
                    className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-glass-border)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[var(--theme-text-primary)] focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all duration-300 placeholder:text-[var(--theme-text-muted)]"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[11px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">
                Correu electrònic
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="tu@exemple.com"
                  className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-glass-border)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[var(--theme-text-primary)] focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all duration-300 placeholder:text-[var(--theme-text-muted)]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[11px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">
                Contrasenya
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Mínim 6 caràcters"
                  className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-glass-border)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[var(--theme-text-primary)] focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all duration-300 placeholder:text-[var(--theme-text-muted)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-app-primary to-brand-secondary text-white shadow-[0_4px_20px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2.5 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : isRegister ? (
                <>
                  <UserPlus size={14} /> Crear compte
                </>
              ) : (
                <>
                  <LogIn size={14} /> Iniciar sessió
                </>
              )}
            </button>
          </form>

          <div className="relative my-7 flex items-center justify-center">
            <div className="absolute inset-x-0 h-px bg-[var(--theme-border)]" />
            <span className="relative glass-subtle px-3 py-0.5 rounded-full text-[10px] text-[var(--theme-text-secondary)]">o</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister)
              setError(null)
              setSuccess(null)
            }}
            className="w-full text-center text-xs font-semibold text-brand-accent hover:text-brand-accent/80 transition-colors duration-300"
          >
            {isRegister
              ? 'Ja tens compte? Inicia sessió'
              : 'No tens compte? Registra\'t'}
          </button>

          <Link href={isFromBlog ? '/blog' : '/'} className="mt-6 flex items-center justify-center gap-1.5 text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors duration-300">
            <ArrowLeft size={10} /> {isFromBlog ? 'Tornar al blog' : 'Tornar a l\'inici'}
          </Link>
        </div>
      </div>
    </div>
  )
}


