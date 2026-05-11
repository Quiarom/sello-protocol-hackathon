import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./components/providers";
import { WalletButton } from "./components/wallet-button";
import { NavigationLinks } from "./components/navigation-links";
import logo from "./assets/logo.jpg";

export const metadata: Metadata = {
  title: {
    default: "Sello Protocol | The Machine-Readable Rights Layer",
    template: "%s | Sello Protocol",
  },
  description:
    "Protect creative work with machine-readable, on-chain licensing. Sello Protocol enables automated usage rights and monetization for AI-era content on Solana.",
  metadataBase: new URL("https://selloprotocol.com"),
  keywords: ["AI Licensing", "Solana x402", "Content Monetization", "Digital Notary", "Authorship Verification"],
  authors: [{ name: "Sello Protocol Team" }],
  icons: {
    icon: "/favicon.jpg",
    shortcut: "/favicon.jpg",
    apple: "/icon.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <nav className="sticky top-0 z-50 border-b border-border-low bg-background/95 backdrop-blur-md">
            <div className="airmail-stripe h-1 opacity-70" />
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-4 sm:px-5 md:px-8">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-6">
                <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-100">
                  <Image
                    src={logo}
                    alt="Sello Protocol"
                    width={44}
                    height={44}
                    className="stamp-image h-10 w-10 object-cover shadow-lg md:h-11 md:w-11"
                    priority
                  />
                  <div className="flex flex-col -space-y-1">
                    <span className="font-headline text-lg font-bold uppercase tracking-[0.22em] text-cream md:text-2xl">
                      Sello
                    </span>
                    <span className="font-mono text-[8px] font-bold uppercase tracking-[0.28em] text-primary">
                      Protocol
                    </span>
                  </div>
                </Link>

                <div className="hidden h-8 w-px bg-border-low lg:block" />
                <NavigationLinks />
              </div>

              <div className="ml-auto flex items-center gap-2 sm:gap-4 md:gap-5">
                <div className="hidden items-center gap-2 sm:flex sm:gap-3">
                  <a
                    href="https://x.com/selloprotocol"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center border border-border-low bg-card text-muted transition-all hover:border-primary hover:text-primary active:scale-95"
                    title="Follow Sello on X"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>

                  <a
                    href="https://github.com/Quiarom/sello-protocol"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center border border-border-low bg-card text-muted transition-all hover:border-primary hover:text-primary active:scale-95"
                    title="Sello Protocol on GitHub"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  </a>

                  <Link
                    href="/dashboard"
                    className="hidden h-9 w-9 items-center justify-center border border-border-low bg-card text-muted transition-all hover:border-primary hover:text-primary active:scale-95 sm:flex lg:hidden"
                    title="Dashboard"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                  </Link>
                </div>

                <div className="hidden h-6 w-px bg-border-low sm:block" />
                <WalletButton />
              </div>
            </div>
          </nav>
          {children}
        </Providers>
      </body>
    </html>
  );
}
