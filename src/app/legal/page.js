import Link from "next/link";
import { ArrowLeft, Shield, Server, Camera, CreditCard, Cookie, FileText } from 'lucide-react';

export const metadata = {
  title: "Termes Legals - thelook",
};

const SECTIONS = [
  {
    id: "responsable",
    title: "1. Responsable del Tractament",
    icon: FileText,
    content: (
      <p className="text-[var(--theme-text-secondary)] leading-relaxed">
        <strong>thelook Inc.</strong>, amb domicili a Mataró (Barcelona), és responsable del
        tractament de les dades personals de l'usuari i l'informa que
        aquestes dades seran tractades de conformitat amb el que disposa el
        Reglament (UE) 2016/679 (GDPR) i la Llei Orgànica 3/2018 (LOPDGDD).
      </p>
    )
  },
  {
    id: "arquitectura",
    title: '2. Arquitectura "Local-First" / Núvol Segur',
    icon: Server,
    content: (
      <p className="text-[var(--theme-text-secondary)] leading-relaxed">
        A diferència d'altres aplicacions, thelook prioritza la privacitat.
        Les imatges del teu armari s'emmagatzemen de forma segura
        al teu compte i només tu hi tens accés mitjançant Supabase. Tu ets el propietari de
        les teves dades i pots sol·licitar-ne l'esborrament quan vulguis.
      </p>
    )
  },
  {
    id: "camera-ia",
    title: "3. Ús de la Càmera i IA",
    icon: Camera,
    content: (
      <p className="text-[var(--theme-text-secondary)] leading-relaxed">
        Per oferir el servei d'escaneig, l'aplicació requereix permís d'accés a la
        càmera. Les imatges capturades s'envien de forma segura
        (SSL/TLS) a processadors de tercers (Google Gemini API)
        exclusivament per a l'anàlisi temporal i la generació de metadades
        (categoria, color, etiquetes). Aquestes imatges NO s'utilitzen per entrenar
        models públics d'IA sense el consentiment explícit de l'usuari i no són conservades per la IA.
      </p>
    )
  },
  {
    id: "subscripcions",
    title: "4. Subscripcions i Pagaments",
    icon: CreditCard,
    content: (
      <p className="text-[var(--theme-text-secondary)] leading-relaxed">
        Els pagaments de la versió Premium (29,99€/any) seran processats de
        manera segura a través d'Stripe. thelook Inc. no emmagatzema
        ni té accés a les dades de la targeta de crèdit de l'usuari directament.
      </p>
    )
  },
  {
    id: "cookies",
    title: "5. Política de Cookies",
    icon: Cookie,
    content: (
      <p className="text-[var(--theme-text-secondary)] leading-relaxed">
        Utilitzem cookies pròpies (autenticació de sessió) necessàries per al
        funcionament de l'aplicació. No utilitzem cookies de tercers per a 
        rastreig publicitari (tracking). En iniciar sessió, acceptes l'ús de les cookies essencials.
      </p>
    )
  },
  {
    id: "drets-arco",
    title: "6. Drets de l'Usuari (ARCO)",
    icon: Shield,
    content: (
      <p className="text-[var(--theme-text-secondary)] leading-relaxed">
        L'usuari pot exercir els drets d'accés, rectificació, portabilitat i
        supressió de les seves dades directament des de l'apartat de Perfil de l'aplicació o contactant amb el nostre DPO (Delegat
        de Protecció de Dades) a: <a href="mailto:privacy@thelook.app" className="text-brand-primary hover:underline font-medium">privacy@thelook.app</a>.
      </p>
    )
  }
];

export default function Legal() {
  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text-primary)] py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors mb-12 font-semibold animate-fadeInUp">
          <ArrowLeft size={16} /> Tornar a l'inici
        </Link>

        <div className="text-center mb-16 animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-gradient">Política de Privacitat<br/>i Termes d'Ús</h1>
          <p className="text-[var(--theme-text-muted)] font-medium text-lg">Darrera actualització: Octubre 2024</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-1/3 glass-subtle rounded-2xl p-6 sticky top-8 animate-fadeInUp hidden lg:block" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileText size={20} className="text-brand-primary" />
              Índex de continguts
            </h3>
            <nav className="flex flex-col gap-3">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <a 
                    key={`nav-${section.id}`} 
                    href={`#${section.id}`}
                    className="flex items-center gap-3 text-sm font-medium text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-hover)] p-2 rounded-lg transition-colors"
                  >
                    <Icon size={16} className="text-[var(--theme-text-muted)]" />
                    {section.title}
                  </a>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="w-full lg:w-2/3 flex flex-col gap-8">
            {SECTIONS.map((section, index) => {
              const Icon = section.icon;
              return (
                <section 
                  key={section.id} 
                  id={section.id} 
                  className="glass rounded-2xl p-8 scroll-mt-24 animate-fadeInUp"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-[var(--theme-glass-bg)] border border-[var(--theme-glass-border)]">
                      <Icon size={24} className="text-brand-primary" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">{section.title}</h2>
                  </div>
                  <div className="text-base">
                    {section.content}
                  </div>
                </section>
              );
            })}
          </div>

        </div>

        <footer className="mt-20 text-center text-[var(--theme-text-muted)] text-sm font-medium animate-fadeInUp" style={{ animationDelay: "0.9s" }}>
          <p>&copy; 2024 thelook Inc. - Tots els drets reservats.</p>
        </footer>
      </div>
    </div>
  );
}
