'use client'

import Link from "next/link";
import { Check, X } from 'lucide-react';
import { useState } from "react";
import { motion } from "framer-motion";
import { createCheckoutSession } from "@/app/actions/stripe";

export default function Pricing({ fullPage = false }) {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const isAnnual = billingCycle === 'annual';

  return (
    <section id="pricing" className={`py-32 relative ${fullPage ? 'pt-40' : ''}`}>
      {/* Background Decorators */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-secondary/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--theme-text-primary)] mb-4">
            Plans flexibles per a tothom
          </h2>
          <p className="text-lg text-[var(--theme-text-secondary)] mb-8">Escull el nivell que s'adapti millor al teu armari.</p>

          {fullPage && (
            <div className="flex flex-col items-center justify-center mb-10">
              <div className="relative inline-flex glass p-1.5 rounded-full">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`relative z-10 px-6 py-2.5 text-sm font-bold rounded-full transition-colors duration-300 ${!isAnnual ? 'text-white' : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]'
                    }`}
                >
                  Mensual
                  {!isAnnual && (
                    <motion.div
                      layoutId="billingTab"
                      className="absolute inset-0 bg-gradient-to-r from-brand-accent to-emerald-400 rounded-full -z-10 shadow-[0_0_15px_rgba(45,212,191,0.4)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>

                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`relative z-10 px-6 py-2.5 text-sm font-bold rounded-full transition-colors duration-300 ${isAnnual ? 'text-white' : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]'
                    }`}
                >
                  Anual
                  {/* Floating Discount Badge */}
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-brand-accent text-zinc-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border border-white/20 rotate-12">
                    -20%
                  </div>

                  {isAnnual && (
                    <motion.div
                      layoutId="billingTab"
                      className="absolute inset-0 bg-gradient-to-r from-brand-accent to-emerald-400 rounded-full -z-10 shadow-[0_0_15px_rgba(45,212,191,0.4)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch max-w-5xl mx-auto">
          {/* Basic Plan */}
          <div className="glass-panel w-full md:w-1/2 px-8 py-10 md:px-12 md:py-14 rounded-[32px] flex flex-col hover:-translate-y-2 transition-transform duration-300">
            <h3 className="text-2xl font-bold text-[var(--theme-text-primary)] mb-1">Bàsic</h3>
            <p className="text-[var(--theme-text-secondary)] text-sm mb-8">Per a armaris petits i essencials.</p>

            <div className="mb-10">
              <div className="text-5xl font-extrabold text-[var(--theme-text-primary)]">
                0€<span className="text-lg font-normal text-[var(--theme-text-muted)] ml-1">/mes</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[var(--theme-border)] mb-8"></div>

            <ul className="flex flex-col gap-5 mb-auto flex-grow">
              <li className="flex items-center gap-3 text-[15px] text-[var(--theme-text-secondary)]">
                <div className="w-5 h-5 rounded-full bg-brand-primary/15 flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-brand-primary" />
                </div>
                Armari fins a 20 peces
              </li>
              <li className="flex items-center gap-3 text-[15px] text-[var(--theme-text-secondary)]">
                <div className="w-5 h-5 rounded-full bg-brand-primary/15 flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-brand-primary" />
                </div>
                5 outfits IA al mes
              </li>
              <li className="flex items-center gap-3 text-[15px] text-[var(--theme-text-secondary)]">
                <div className="w-5 h-5 rounded-full bg-brand-primary/15 flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-brand-primary" />
                </div>
                Inclou Anuncis
              </li>
              <li className="flex items-center gap-3 text-[15px] text-[var(--theme-text-muted)]">
                <div className="w-5 h-5 rounded-full bg-zinc-500/10 flex items-center justify-center flex-shrink-0">
                  <X size={12} className="text-zinc-500" />
                </div>
                Sense planificador setmanal
              </li>
            </ul>

            <div className="mt-10">
              <Link
                href="/login"
                className="block w-full py-4 rounded-full text-center font-semibold text-[var(--theme-text-primary)] glass hover:bg-[var(--theme-hover)] transition-colors"
              >
                Començar Demo
              </Link>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="relative w-full md:w-1/2 p-[1px] rounded-[32px] bg-gradient-to-b from-brand-accent via-brand-primary to-purple-600 group hover:-translate-y-2 transition-transform duration-300">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-accent text-zinc-950 font-bold px-5 py-1.5 rounded-full text-xs tracking-widest z-10 shadow-lg shadow-brand-accent/30">
              RECOMANAT
            </div>

            <div className="bg-[var(--theme-bg)] w-full h-full rounded-[31px] px-8 py-10 md:px-12 md:py-14 flex flex-col relative overflow-hidden">
              {/* Subtle inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/8 via-transparent to-brand-accent/5 pointer-events-none"></div>

              <h3 className="text-2xl font-bold text-[var(--theme-text-primary)] mb-1 relative z-10">Premium</h3>
              <p className="text-[var(--theme-text-secondary)] text-sm mb-8 relative z-10">L'experiència completa thelook.</p>

              <div className="mb-10 relative z-10">
                <div className="text-5xl font-extrabold text-[var(--theme-text-primary)] flex items-end gap-1">
                  {isAnnual ? '29.99€' : '2.99€'}
                  <span className="text-lg font-normal text-[var(--theme-text-muted)] mb-1">/{isAnnual ? 'any' : 'mes'}</span>
                </div>
                {fullPage && isAnnual && (
                  <div className="text-brand-accent text-xs font-medium mt-3 flex items-center gap-1.5 bg-brand-accent/10 w-fit px-3 py-1.5 rounded-full">
                    <Check size={12} className="font-bold" /> T'estalvies 5.89€ a l'any (2 mesos gratis!)
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-[var(--theme-border)] mb-8 relative z-10"></div>

              <ul className="flex flex-col gap-5 mb-auto flex-grow relative z-10">
                <li className="flex items-center gap-3 text-[15px] text-[var(--theme-text-secondary)]">
                  <div className="w-5 h-5 rounded-full bg-brand-accent/15 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-brand-accent" />
                  </div>
                  Armari il·limitat
                </li>
                <li className="flex items-center gap-3 text-[15px] text-[var(--theme-text-secondary)]">
                  <div className="w-5 h-5 rounded-full bg-brand-accent/15 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-brand-accent" />
                  </div>
                  Outfits IA il·limitats
                </li>
                <li className="flex items-center gap-3 text-[15px] text-[var(--theme-text-secondary)]">
                  <div className="w-5 h-5 rounded-full bg-brand-accent/15 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-brand-accent" />
                  </div>
                  Sense Anuncis
                </li>
                <li className="flex items-center gap-3 text-[15px] text-[var(--theme-text-secondary)]">
                  <div className="w-5 h-5 rounded-full bg-brand-accent/15 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-brand-accent" />
                  </div>
                  Planificador Setmanal
                  <span className="text-[11px] text-[var(--theme-text-muted)] bg-[var(--theme-hover)] px-2 py-0.5 rounded-full ml-auto">pròximament</span>
                </li>
              </ul>

              <div className="mt-10 relative z-10">
                <form action={createCheckoutSession.bind(null,
                  isAnnual
                    ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL
                    : process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY
                )}>
                  <button
                    type="submit"
                    className="w-full py-4 rounded-full text-center font-semibold text-zinc-950 bg-gradient-to-r from-brand-accent to-emerald-400 hover:from-emerald-400 hover:to-brand-accent transition-all shadow-[0_0_20px_rgba(45,212,191,0.3)] cursor-pointer"
                  >
                    Fer-se Premium
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
