"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "../lib/wallet/context";

export function NavigationLinks() {
  const { status } = useWallet();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <div className="hidden flex-nowrap items-center gap-x-4 font-display text-base uppercase tracking-[0.14em] text-muted lg:flex xl:gap-x-8">
        <Link
          href="/register"
          className={`shrink-0 whitespace-nowrap transition-colors hover:text-primary ${isActive("/register") ? "text-primary underline decoration-primary/30 underline-offset-8" : ""}`}
        >
          Create AI Checkout
        </Link>
        <Link
          href="/onboarding/agent"
          className={`shrink-0 whitespace-nowrap transition-colors hover:text-primary ${isActive("/onboarding/agent") ? "text-primary underline decoration-primary/30 underline-offset-8" : ""}`}
        >
          Agent Integration
        </Link>
        <Link
          href="/blog/protected-article"
          className={`shrink-0 whitespace-nowrap transition-colors hover:text-primary ${isActive("/blog/protected-article") ? "text-primary underline decoration-primary/30 underline-offset-8" : ""}`}
        >
          Demo Article
        </Link>

        {mounted && status === "connected" && (
          <Link
            href="/dashboard"
            className={`shrink-0 whitespace-nowrap transition-colors hover:text-primary animate-in fade-in slide-in-from-left-2 ${isActive("/dashboard") ? "text-primary underline decoration-primary/30 underline-offset-8" : ""}`}
          >
            Revenue Console
          </Link>
        )}
      </div>

      <div className="flex flex-nowrap basis-full items-center gap-2 overflow-x-auto pb-1 font-display text-sm uppercase tracking-[0.14em] text-muted lg:hidden">
        <Link
          href="/register"
          className={`shrink-0 border px-3 py-2 transition-colors hover:border-primary hover:text-primary ${isActive("/register") ? "border-primary text-primary" : "border-border-low"}`}
        >
          Create AI Checkout
        </Link>
        <Link
          href="/onboarding/agent"
          className={`shrink-0 border px-3 py-2 transition-colors hover:border-primary hover:text-primary ${isActive("/onboarding/agent") ? "border-primary text-primary" : "border-border-low"}`}
        >
          Agent Integration
        </Link>
        <Link
          href="/blog/protected-article"
          className={`shrink-0 border px-3 py-2 transition-colors hover:border-primary hover:text-primary ${isActive("/blog/protected-article") ? "border-primary text-primary" : "border-border-low"}`}
        >
          Demo Article
        </Link>
        {mounted && status === "connected" && (
          <Link
            href="/dashboard"
            className={`shrink-0 border px-3 py-2 transition-colors hover:border-primary hover:text-primary ${isActive("/dashboard") ? "border-primary text-primary" : "border-border-low"}`}
          >
            Revenue Console
          </Link>
        )}
      </div>
    </>
  );
}
