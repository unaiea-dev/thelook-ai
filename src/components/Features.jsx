import { Layers, Timer, Globe } from 'lucide-react';

export default function Features() {
  return (
    <section id="features" className="py-28 relative">
      {/* Gradient transitions */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[var(--theme-bg)] to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--theme-bg)] to-transparent pointer-events-none z-0" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-5 text-[var(--theme-text-primary)]">
            Per què triar <span className="text-gradient">thelook?</span>
          </h2>
          <p className="text-sm text-[var(--theme-text-secondary)] max-w-2xl mx-auto">
            La combinació perfecta entre intel·ligència artificial i moda per fer el teu dia a dia més fàcil.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-28">
          <div className="glass p-7 rounded-2xl group hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center text-white text-xl mb-5 shadow-lg shadow-brand-primary/15 group-hover:scale-110 transition-transform duration-300">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--theme-text-primary)] mb-2">Organització</h3>
            <p className="text-[var(--theme-text-secondary)] text-sm leading-relaxed">
              Tota la teva roba en un sol lloc. Redescobreix peces oblidades i maximitza les teves opcions.
            </p>
          </div>
          
          <div className="glass p-7 rounded-2xl group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-brand-accent/8 blur-[40px] rounded-full" />
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-accent to-emerald-500 flex items-center justify-center text-white text-xl mb-5 shadow-lg shadow-brand-accent/15 group-hover:scale-110 transition-transform duration-300">
              <Timer className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--theme-text-primary)] mb-2">Estalvi de Temps</h3>
            <p className="text-[var(--theme-text-secondary)] text-sm leading-relaxed">
              Recupera les 100 hores anuals que passes decidint què posar-te cada matí.
            </p>
          </div>
          
          <div className="glass p-7 rounded-2xl group hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white text-xl mb-5 shadow-lg shadow-orange-500/15 group-hover:scale-110 transition-transform duration-300">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--theme-text-primary)] mb-2">Sostenibilitat</h3>
            <p className="text-[var(--theme-text-secondary)] text-sm leading-relaxed">
              Utilitza més el que ja tens. Compra menys, però millor i de forma intel·ligent.
            </p>
          </div>
        </div>

        {/* Tech Steps */}
        <div className="relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[250px] bg-brand-primary/8 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="text-center mb-14 relative z-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-[var(--theme-text-primary)] mb-3">La Màgia darrere thelook</h2>
            <p className="text-[var(--theme-text-muted)] text-sm">La nostra tecnologia explicada pas a pas.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
            {[
              { num: "1", icon: "fa-camera-retro", title: "Digitalització", desc: "La nostra càmera detecta vores i classifica la peça en 0,5 segons." },
              { num: "2", icon: "fa-brain", title: "Cervell Gemini", desc: "L'API de Google DeepMind entén l'estil, teixits i patrons de la teva roba." },
              { num: "3", icon: "fa-cloud-sun-rain", title: "Clima Real", desc: "Connectat a OpenWeatherMap. Si plou, thelook s'adapta a l'instant." },
              { num: "4", icon: "fa-shirt", title: "Generador", desc: "Generem 3 opcions d'outfit sobre el teu maniquí virtual." }
            ].map((step, idx) => (
              <div key={idx} className="glass p-5 rounded-2xl relative mt-3 group hover:bg-[var(--theme-hover)] transition-all duration-300">
                <div className="absolute -top-4 left-5 w-8 h-8 rounded-lg bg-brand-accent text-zinc-950 font-semibold flex items-center justify-center text-sm shadow-lg shadow-brand-accent/20 group-hover:-translate-y-0.5 transition-transform duration-300">
                  {step.num}
                </div>
                <div className="text-brand-primary/70 text-2xl mb-3 mt-1">
                  <i className={`fa-solid ${step.icon}`}></i>
                </div>
                <h4 className="text-base font-semibold text-[var(--theme-text-primary)] mb-1.5">{step.title}</h4>
                <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
