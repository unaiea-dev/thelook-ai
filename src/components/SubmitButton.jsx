'use client'

import { useFormStatus } from 'react-dom'
import { Loader2, ArrowRight } from 'lucide-react'

export default function SubmitButton({ children, text = 'Enviar', className = 'w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-app-primary to-brand-secondary text-white shadow-[0_4px_20px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2.5' }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="animate-spin" size={18} />
      ) : children ? (
        children
      ) : (
        <>
          <span>{text}</span>
          <ArrowRight size={16} />
        </>
      )}
    </button>
  )
}
