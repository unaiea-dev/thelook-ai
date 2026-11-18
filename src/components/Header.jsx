"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import { User, Sparkles, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header({ user, variant = "home" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (e, targetId) => {
    e.preventDefault();
    setMenuOpen(false);
    // Small delay to let the menu close animation start before scrolling
    setTimeout(() => {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
        });
      }
    }, 150);
  };

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Handle header opacity on scroll
  useEffect(() => {
    const handleScrollEvent = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScrollEvent);
    // Initial check
    handleScrollEvent();

    return () => window.removeEventListener("scroll", handleScrollEvent);
  }, []);

  // Navigation items for reuse
  const navLinks = [
    { id: "hero", label: "Inici" },
    { id: "features", label: "Funcionalitats" },
    { id: "pricing", label: "Preus", isPage: true, href: "/pricing" },
    { id: "blog", label: "Blog", isPage: true, href: "/blog" },
    { id: "team", label: "Equip" },
  ];

  // Framer Motion variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const menuContentVariants = {
    hidden: { opacity: 0, y: -40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2, staggerChildren: 0.03, staggerDirection: -1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 28 } },
    exit: { opacity: 0, y: -8, scale: 0.95, transition: { duration: 0.15 } },
  };

  const renderNavLink = (link) => {
    if (link.isPage) {
      return (
        <motion.div key={link.id} variants={itemVariants} className="w-full">
          <Link
            href={link.href}
            onClick={closeMenu}
            className={`block w-full text-center py-3.5 px-4 text-lg font-medium tracking-wide rounded-2xl transition-all duration-300 hover:bg-[var(--theme-hover)] ${
              (variant === "pricing" && link.id === "pricing") || (variant === "blog" && link.id === "blog")
                ? "text-[var(--theme-text-primary)] bg-[var(--theme-hover)]"
                : "text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)]"
            }`}
          >
            {link.label}
          </Link>
        </motion.div>
      );
    }

    if (variant === "pricing" || variant === "blog") {
      return (
        <motion.div key={link.id} variants={itemVariants} className="w-full">
          <Link
            href={`/#${link.id}`}
            onClick={closeMenu}
            className="block w-full text-center py-3.5 px-4 text-lg font-medium tracking-wide text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] rounded-2xl transition-all duration-300 hover:bg-[var(--theme-hover)]"
          >
            {link.label}
          </Link>
        </motion.div>
      );
    }

    return (
      <motion.div key={link.id} variants={itemVariants} className="w-full">
        <a
          href={`#${link.id}`}
          onClick={(e) => handleScroll(e, link.id)}
          className="block w-full text-center py-3.5 px-4 text-lg font-medium tracking-wide text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] rounded-2xl transition-all duration-300 hover:bg-[var(--theme-hover)]"
        >
          {link.label}
        </a>
      </motion.div>
    );
  };

  return (
    <header className="fixed top-0 w-full z-50">
      {/* ── Background Layer (separate so it hides instantly when menu opens) ── */}
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          isScrolled && !menuOpen
            ? "bg-[var(--theme-bg)]/30 backdrop-blur-xl border-b border-[var(--theme-border)] shadow-sm opacity-100"
            : "opacity-0"
        }`}
        style={menuOpen ? { transitionDuration: '0s' } : undefined}
      />
      <div className="relative max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* ── Logo ── */}
        <Link href="/" className="transition-opacity duration-300 hover:opacity-80 flex items-center">
          <Image
            src="/logoEnteroBlanco.svg"
            alt="thelook"
            className="h-10 w-auto object-contain opacity-90 logo-white"
            width={140}
            height={56}
            priority
          />
          <Image
            src="/logoEntero.svg"
            alt="thelook"
            className="h-10 w-auto object-contain opacity-90 logo-black"
            width={140}
            height={56}
            priority
          />
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-7 text-xs font-medium tracking-wide">
            <li>
              {variant === "pricing" || variant === "blog" ? (
                <Link href="/#hero" className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors duration-300">
                  Inici
                </Link>
              ) : (
                <a href="#hero" onClick={(e) => handleScroll(e, "hero")} className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors duration-300">
                  Inici
                </a>
              )}
            </li>
            <li>
              {variant === "pricing" || variant === "blog" ? (
                <Link href="/#features" className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors duration-300">
                  Funcionalitats
                </Link>
              ) : (
                <a href="#features" onClick={(e) => handleScroll(e, "features")} className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors duration-300">
                  Funcionalitats
                </a>
              )}
            </li>
            <li>
              <Link href="/pricing" className={`transition-colors duration-300 ${variant === "pricing" ? "text-[var(--theme-text-primary)]" : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]"}`}>
                Preus
              </Link>
            </li>
            <li>
              <Link href="/blog" className={`transition-colors duration-300 ${variant === "blog" ? "text-[var(--theme-text-primary)]" : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]"}`}>
                Blog
              </Link>
            </li>
            <li>
              {variant === "pricing" || variant === "blog" ? (
                <Link href="/#team" className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors duration-300">
                  Equip
                </Link>
              ) : (
                <a href="#team" onClick={(e) => handleScroll(e, "team")} className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors duration-300">
                  Equip
                </a>
              )}
            </li>
          </ul>
        </nav>

        {/* ── Desktop Right Actions ── */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <Link 
              href={variant === 'blog' ? '/blog/nou' : '/app'} 
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-[var(--theme-text-primary)] glass border border-[var(--theme-border)] rounded-full transition-all duration-300 hover:bg-[var(--theme-hover)] hover:border-brand-primary/50 hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" /> {variant === 'blog' ? 'Escriure article' : 'Anar a l\'app'}
            </Link>
          ) : (
            <Link 
              href={variant === 'blog' ? '/login?next=/blog' : '/login'} 
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-[var(--theme-text-primary)] glass rounded-full transition-all duration-300 hover:bg-[var(--theme-hover)] hover:scale-105"
            >
              <User className="w-3.5 h-3.5" /> Iniciar sessió
            </Link>
          )}
        </div>

        {/* ── Mobile Right Actions (Hamburger + Theme) ── */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative w-9 h-9 flex items-center justify-center rounded-full glass transition-all duration-300 hover:bg-[var(--theme-hover)]"
            aria-label={menuOpen ? "Tancar menú" : "Obrir menú"}
            aria-expanded={menuOpen}
          >
            <Menu
              className={`w-[18px] h-[18px] text-[var(--theme-text-primary)] absolute transition-all duration-300 ${menuOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"}`}
            />
            <X
              className={`w-[18px] h-[18px] text-[var(--theme-text-primary)] absolute transition-all duration-300 ${menuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"}`}
            />
          </button>
        </div>
      </div>

      {/* ── Mobile Fullscreen Overlay (Framer Motion) ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-[var(--theme-bg)]/85 backdrop-blur-2xl"
              onClick={closeMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />

            {/* Menu Content */}
            <motion.div
              className="relative flex flex-col items-center justify-center h-full px-8"
              variants={menuContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* ── Close Button ── */}
              <motion.button
                onClick={closeMenu}
                className="absolute top-5 right-6 w-11 h-11 flex items-center justify-center rounded-full glass hover:bg-[var(--theme-hover)] transition-colors duration-300"
                aria-label="Tancar menú"
                variants={itemVariants}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-[var(--theme-text-primary)]" />
              </motion.button>

              {/* Nav Links */}
              <nav className="flex flex-col items-center gap-2 mb-10 w-full max-w-xs">
                {navLinks.map((link) => renderNavLink(link))}
              </nav>

              {/* Divider */}
              <motion.div
                className="w-16 h-px bg-[var(--theme-border)] mb-8"
                variants={itemVariants}
              />

              {/* CTA Button */}
              <motion.div variants={itemVariants} className="w-full max-w-xs">
                {user ? (
                  <Link
                    href={variant === 'blog' ? '/blog/nou' : '/app'}
                    onClick={closeMenu}
                    className="inline-flex items-center justify-center gap-3 w-full px-7 py-4 bg-[var(--theme-text-primary)] text-[var(--theme-bg)] rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105"
                  >
                    <Sparkles className="w-4 h-4" /> {variant === 'blog' ? 'Escriure article' : 'Anar a l\'app'}
                  </Link>
                ) : (
                  <Link
                    href={variant === 'blog' ? '/login?next=/blog' : '/login'}
                    onClick={closeMenu}
                    className="inline-flex items-center justify-center gap-3 w-full px-7 py-4 bg-[var(--theme-text-primary)] text-[var(--theme-bg)] rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105"
                  >
                    <User className="w-4 h-4" /> Iniciar sessió
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
