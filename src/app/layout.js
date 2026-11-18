import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { GoogleAdSense } from "@/components/ads";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});



export const metadata = {
  title: "thelook - El teu armari intel·ligent",
  description: "Digitalitza la teva roba i deixa que la nostra Intel·ligència Artificial triï l'outfit perfecte per a tu cada matí.",
  manifest: "/manifest.json",
  icons: {
    icon: '/logo.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "thelook",
  },
};

export const viewport = {
  themeColor: "#09090b", // zinc-950
};

export default function RootLayout({ children }) {
  return (
    <html lang="ca" className={`${inter.variable} h-full antialiased scroll-smooth`} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              let theme = localStorage.getItem('app-theme');
              if (!theme) {
                theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              }
              document.documentElement.setAttribute('data-theme', theme);
            } catch (_) {}
          `
        }} />
        <GoogleAdSense />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--theme-bg)] text-[var(--theme-text-primary)] font-sans selection:bg-brand-primary/30 selection:text-brand-primary">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
