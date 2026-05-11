"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "@/app/assets/logo.jpg";
import { ConnectWalletButton } from "@/app/components/wallet/connect-wallet-button";

const links = [
  { href: "/register", label: "Register" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/blog/protected-article", label: "Demo Article" },
  { href: "/onboarding/agent", label: "Agent Onboarding" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border-low bg-background/95 backdrop-blur-md">
      <div className="airmail-stripe h-1 opacity-70" />
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
          <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-100">
            <Image
              src={logo}
              alt="Sello Protocol"
              width={48}
              height={48}
              className="stamp-image h-11 w-11 object-cover shadow-lg"
              priority
            />
            <div className="flex flex-col -space-y-1">
              <span className="font-headline text-xl font-bold uppercase tracking-[0.22em] text-cream md:text-2xl">
                Sello
              </span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-primary">
                Protocol
              </span>
            </div>
          </Link>

          <div className="hidden h-8 w-px bg-border-low lg:block" />

          <nav className="flex flex-wrap items-center gap-4 font-display text-sm uppercase tracking-[0.14em] text-muted md:gap-6">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors hover:text-primary ${active ? "text-primary underline decoration-primary/30 underline-offset-8" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <span className="stamp-badge border-green-ink/30 bg-green-ink/10 text-green-ink">
            Devnet
          </span>
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}
