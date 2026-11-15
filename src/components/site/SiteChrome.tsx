import Link from "next/link";
import { site } from "@/lib/site";

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function Header() {
  return (
    <header className="border-b border-line bg-canvas/80 backdrop-blur">
      <Container className="flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Logo />
          {site.name}
        </Link>
        <nav className="flex items-center gap-1 text-sm sm:gap-4">
          <Link href="/work" className="rounded px-2 py-1 text-muted hover:text-ink">
            Work
          </Link>
          <Link href="/#pricing" className="hidden rounded px-2 py-1 text-muted hover:text-ink sm:inline">
            Pricing
          </Link>
          <Link href="/request" className="btn-primary !px-3 !py-1.5">
            Request a visual
          </Link>
        </nav>
      </Container>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <Container className="flex flex-col gap-2 py-8 text-sm text-muted sm:flex-row sm:justify-between">
        <p>
          © {site.name}. {site.tagline}
        </p>
        <p>Client work is never published without explicit approval.</p>
      </Container>
    </footer>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
      <rect width="24" height="24" rx="6" fill="var(--ink)" />
      <path d="M5 16 C8 16 9 7 12 7 S16 14 19 10" fill="none" stroke="var(--canvas)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="7" r="1.7" fill="var(--viz-2)" />
    </svg>
  );
}
