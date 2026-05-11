"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "../lib/wallet/context";

export function NavigationLinks() {
  const { status } = useWallet();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <div className="hidden items-center gap-6 font-display text-base uppercase tracking-[0.14em] text-muted lg:flex">
        <Link
          href="/register"
          className={`transition-colors hover:text-primary ${isActive("/register") ? "text-primary underline decoration-primary/30 underline-offset-8" : ""}`}
        >
          Creator
        </Link>
        <Link
          href="/onboarding/agent"
          className={`transition-colors hover:text-primary ${isActive("/onboarding/agent") ? "text-primary underline decoration-primary/30 underline-offset-8" : ""}`}
        >
          Agent
        </Link>

        {status === "connected" && (
          <Link
            href="/dashboard"
            className={`transition-colors hover:text-primary animate-in fade-in slide-in-from-left-2 ${isActive("/dashboard") ? "text-primary underline decoration-primary/30 underline-offset-8" : ""}`}
          >
            Dashboard
          </Link>
        )}
      </div>

      <div className="flex basis-full items-center gap-2 overflow-x-auto pb-1 font-display text-xs uppercase tracking-[0.14em] text-muted lg:hidden">
        <Link
          href="/register"
          className={`shrink-0 border px-3 py-2 transition-colors hover:border-primary hover:text-primary ${isActive("/register") ? "border-primary text-primary" : "border-border-low"}`}
        >
          Creator
        </Link>
        <Link
          href="/onboarding/agent"
          className={`shrink-0 border px-3 py-2 transition-colors hover:border-primary hover:text-primary ${isActive("/onboarding/agent") ? "border-primary text-primary" : "border-border-low"}`}
        >
          Agent
        </Link>
        <Link
          href="/blog/protected-article"
          className={`shrink-0 border px-3 py-2 transition-colors hover:border-primary hover:text-primary ${isActive("/blog/protected-article") ? "border-primary text-primary" : "border-border-low"}`}
        >
          Demo Article
        </Link>
        {status === "connected" && (
          <Link
            href="/dashboard"
            className={`shrink-0 border px-3 py-2 transition-colors hover:border-primary hover:text-primary ${isActive("/dashboard") ? "border-primary text-primary" : "border-border-low"}`}
          >
            Dashboard
          </Link>
        )}
      </div>
    </>
  );
}
