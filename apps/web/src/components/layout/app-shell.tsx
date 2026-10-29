import Link from "next/link";
import { Navigation } from "@/components/layout/navigation";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh bg-background scheme-dark lg:grid lg:grid-cols-[16rem_1fr]">
      <a
        href="#main-content"
        className="sr-only z-10 bg-background p-4 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Saltar al contenido
      </a>
      <aside className="border-b border-white/10 px-5 py-7 sm:px-8 lg:flex lg:min-h-dvh lg:flex-col lg:border-r lg:border-b-0 lg:px-6 lg:py-10">
        <Link href="/dashboard" className="mb-8 block w-fit" aria-label="Umbral LIVE FX, inicio">
          <span className="block text-xs font-semibold tracking-[0.24em] text-white/60">UMBRALCREEPY</span>
          <span className="mt-2 block text-xl font-semibold tracking-tight">
            Umbral <span className="text-brand">LIVE FX</span>
          </span>
        </Link>
        <Navigation />
        <p className="mt-8 border-t border-white/10 pt-5 text-xs leading-6 text-white/60 lg:mt-auto">
          Una experiencia de UmbralCreepy.
        </p>
      </aside>
      <main id="main-content" tabIndex={-1} className="min-w-0 px-6 py-12 outline-none sm:px-12 lg:px-16 lg:py-20">
        {children}
      </main>
    </div>
  );
}
