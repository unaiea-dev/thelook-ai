import { Hash } from 'lucide-react';

export default function Team() {
  return (
    <section id="team" className="py-28 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-semibold text-[var(--theme-text-primary)] mb-5">L'Equip Fundador</h2>
          <p className="text-[var(--theme-text-secondary)] text-sm max-w-2xl mx-auto">Els cervells darrere thelook.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          <div className="glass p-8 rounded-2xl text-center group hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full glass-subtle text-[10px] font-semibold tracking-widest text-brand-primary mb-5 uppercase">
                Co-Founder & CPO
              </span>
              <h3 className="text-2xl font-semibold text-[var(--theme-text-primary)] mb-3">Iván</h3>
              <p className="text-[var(--theme-text-secondary)] italic text-sm leading-relaxed">
                "Passionat pel minimalisme i la interacció humà-màquina. L'Iván converteix línies de codi en experiències visuals fluides."
              </p>
            </div>
          </div>
          
          <div className="glass p-8 rounded-2xl text-center group hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full glass-subtle text-[10px] font-semibold tracking-widest text-brand-secondary mb-5 uppercase">
                Co-Founder & CMO
              </span>
              <h3 className="text-2xl font-semibold text-[var(--theme-text-primary)] mb-3">Maria</h3>
              <p className="text-[var(--theme-text-secondary)] italic text-sm leading-relaxed">
                "La ment creativa darrere de thelook. La Maria va tenir la idea de negoci original, decidida a transformar la nostra relació diària amb la moda."
              </p>
            </div>
          </div>

          <div className="glass p-8 rounded-2xl text-center group hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full glass-subtle text-[10px] font-semibold tracking-widest text-brand-accent mb-5 uppercase">
                Co-Founder & CTO
              </span>
              <h3 className="text-2xl font-semibold text-[var(--theme-text-primary)] mb-3">Unai</h3>
              <p className="text-[var(--theme-text-secondary)] italic text-sm leading-relaxed">
                "Enginyer de software amb obsessió per l'eficiència. L'Unai lidera el desenvolupament tècnic, assegurant escalabilitat i rendiment."
              </p>
            </div>
          </div>
        </div>

        <div className="glass max-w-3xl mx-auto p-10 rounded-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/8 blur-[60px] rounded-full pointer-events-none" />
          
          <h3 className="text-xl font-semibold text-[var(--theme-text-primary)] mb-3 relative z-10">La Nostra Història</h3>
          <p className="text-[var(--theme-text-secondary)] text-sm leading-relaxed mb-7 relative z-10">
            "Tot va començar amb un <span className="text-[var(--theme-text-primary)] font-semibold">'No tinc res a posar-me'</span>. Vam decidir unir tecnologia i moda per crear el primer armari realment intel·ligent."
          </p>
          
          <div className="flex justify-center gap-3 relative z-10">
            <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-[var(--theme-text-primary)] hover:bg-[var(--theme-hover)] hover:-translate-y-0.5 transition-all duration-300" aria-label="TikTok">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9a6.33 6.33 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.05a8.27 8.27 0 0 0 4.76 1.5V7.12a4.83 4.83 0 0 1-1-.43z"/></svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-[var(--theme-text-primary)] hover:bg-[var(--theme-hover)] hover:-translate-y-0.5 transition-all duration-300" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
