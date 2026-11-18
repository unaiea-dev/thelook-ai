import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--theme-border)] bg-[var(--theme-glass-bg)] mt-12 py-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[var(--theme-text-secondary)] text-xs">&copy; {new Date().getFullYear()} thelook Inc. — Mataró, Barcelona</p>
        <div className="flex flex-wrap justify-center gap-8 text-xs text-[var(--theme-text-muted)]">
          <a href="mailto:hola@thelook.app" className="hover:text-[var(--theme-text-primary)] transition-colors duration-300">Contacte</a>
          <Link href="/legal" className="hover:text-[var(--theme-text-primary)] transition-colors duration-300">Privacitat i Termes</Link>
        </div>
      </div>
    </footer>
  );
}
