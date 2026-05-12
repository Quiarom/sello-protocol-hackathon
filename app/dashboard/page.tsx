"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useWallet } from "@/app/lib/wallet/context";
import { ellipsify } from "@/app/lib/explorer";
import { CreatorDashboardView } from "@/app/components/dashboard/CreatorDashboardView";

type NarrationFile = {
  id: string;
  name: string;
  audioUrl: string;
  createdAt: string;
  sizeOriginal: number;
};

const SELLO_PROGRAM_ID = "HhXvRpC6uDfCF6sHNWv3xD2yzyjpiEW17eeK13tFaycC";
const DEMO_ARTICLE_PATH = "/blog/protected-article";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-20 text-center font-display text-2xl animate-pulse text-cream">
          Loading Ledger...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "creator";
  const { signer, status } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="overflow-x-clip border-t border-border-low bg-card/10">
      <div className="mx-auto max-w-7xl border-x border-border-low bg-background/20 space-y-8 md:space-y-12 px-4 py-8 sm:px-6 md:px-8 lg:px-12 lg:py-16">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border-low pb-8">
          <div className="space-y-2 text-center md:text-left">
            <p className="stamp-badge text-primary uppercase text-xs tracking-widest mx-auto md:mx-0 w-fit">
              Aval Newsrooms
            </p>
            <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-cream">
              {view === "agent" ? "Agent Registry" : "Revenue Console"}
            </h1>
            <p className="text-muted text-base md:text-lg max-w-2xl mx-auto md:mx-0 leading-relaxed">
              {view === "agent"
                ? "History of rights settlement and Proof of Consent receipts issued by your AI."
                : "Evidence and revenue for AI content usage. Aval shows which articles have AI-readable rules, which agent requests were allowed or blocked, and which Proof of Consent receipts exist."}
            </p>
          </div>

          {status === "connected" && signer && (
            <div className="postal-card p-4 flex items-center gap-4 bg-background/50 border-primary/20 shrink-0 self-center md:self-end">
              <div className="h-2 w-2 rounded-full bg-green-ink animate-pulse" />
              <div className="space-y-0.5">
                <p className="font-mono text-xs uppercase text-muted tracking-widest">
                  Active Wallet
                </p>
                <p className="font-mono text-xs text-cream">
                  {ellipsify(signer.address, 6)}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 sm:gap-4 border-b border-border-low">
          <a
            href="/dashboard?view=creator"
            className={`flex-1 md:flex-none text-center px-4 sm:px-8 py-3 sm:py-4 font-display text-xs sm:text-sm tracking-widest uppercase transition-all ${view === "creator" ? "bg-card text-primary border-b-2 border-primary" : "text-muted hover:text-cream"}`}
          >
            Creator
          </a>
          <a
            href="/dashboard?view=agent"
            className={`flex-1 md:flex-none text-center px-4 sm:px-8 py-3 sm:py-4 font-display text-xs sm:text-sm tracking-widest uppercase transition-all ${view === "agent" ? "bg-card text-primary border-b-2 border-primary shadow-inner" : "text-muted hover:text-cream"}`}
          >
            Agent
          </a>
        </div>

        {view === "agent" ? (
          <AgentDashboardView />
        ) : (
          <CreatorDashboardWrapper />
        )}
      </div>
    </main>
  );
}

function AgentDashboardView() {
  const [narrations, setNarrations] = useState<NarrationFile[]>([]);
  const [isLoadingNarrations, setIsLoadingNarrations] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadNarrations() {
      try {
        const response = await fetch("/api/narrations", { cache: "no-store" });
        const body = (await response.json()) as {
          narrations?: NarrationFile[];
        };
        if (isMounted) setNarrations(body.narrations ?? []);
      } catch {
        if (isMounted) setNarrations([]);
      } finally {
        if (isMounted) setIsLoadingNarrations(false);
      }
    }

    void loadNarrations();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Stats */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="postal-card p-6 md:p-8 border-primary/30 bg-primary/[0.03]">
          <p className="font-mono text-xs uppercase text-muted tracking-widest">
            Generated Audio
          </p>
          <p className="font-headline text-3xl md:text-4xl font-black text-primary mt-2 tabular-nums">
            {narrations.length}
          </p>
        </div>
        <div className="postal-card p-6 md:p-8 border-gold/30">
          <p className="font-mono text-xs uppercase text-muted tracking-widest">
            Demo Article
          </p>
          <p className="font-headline text-3xl md:text-4xl font-black text-gold mt-2">
            1
          </p>
        </div>
        <div className="postal-card p-6 md:p-8 border-muted/30">
          <p className="font-mono text-xs uppercase text-muted tracking-widest">
            Network
          </p>
          <p className="font-headline text-3xl md:text-4xl font-black text-cream mt-2">
            Devnet
          </p>
        </div>
        <div className="postal-card p-6 md:p-8 border-green-ink/30 bg-green-ink/[0.03]">
          <p className="font-mono text-xs uppercase text-muted tracking-widest">
            Program
          </p>
          <a
            href={`https://explorer.solana.com/address/${SELLO_PROGRAM_ID}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block font-mono text-sm font-bold text-green-ink underline underline-offset-4"
          >
            {ellipsify(SELLO_PROGRAM_ID, 5)}
          </a>
        </div>
      </div>

      <section className="postal-card p-6 sm:p-8 border-primary/20">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="font-display text-2xl sm:text-3xl uppercase tracking-widest text-cream">
              Agent Integration Registry
            </p>
            <p className="max-w-2xl text-sm text-muted">
              This shows the agent side of Sello. The publisher already created
              the checkout. The agent now reads the rules, pays for the paid
              action, and leaves a Proof of Consent receipt.
            </p>
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              Endpoint: /api/narrate · Audio source: ElevenLabs narrations
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/onboarding/agent"
              className="stamp-button py-3 px-6 text-sm"
            >
              Run Agent Demo
            </a>
            <a
              href={DEMO_ARTICLE_PATH}
              className="stamp-button stamp-button-secondary py-3 px-6 text-sm"
            >
              Open Article
            </a>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-border-low pb-4 gap-4">
          <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-widest text-primary">
            Voice Assets
          </h3>
          <span className="stamp-badge text-xs text-muted">
            ElevenLabs Cache
          </span>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {isLoadingNarrations ? (
            <div className="postal-card p-8 text-sm text-muted">
              Loading generated narrations...
            </div>
          ) : narrations.length > 0 ? (
            narrations.map((file) => (
              <article
                key={file.id}
                className="postal-card p-5 border-primary/20 bg-primary/[0.03]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-display text-xl uppercase tracking-widest text-cream">
                      Narration
                    </p>
                    <p className="mt-1 break-all font-mono text-xs text-muted">
                      {file.name || file.id}
                    </p>
                    <p className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">
                      {new Date(file.createdAt).toLocaleString()} ·{" "}
                      {(file.sizeOriginal / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <a
                    href={file.audioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="stamp-badge shrink-0 text-xs text-primary"
                  >
                    Open
                  </a>
                </div>
                <audio
                  controls
                  preload="metadata"
                  src={file.audioUrl}
                  className="mt-4 w-full accent-primary"
                />
              </article>
            ))
          ) : (
            <div className="postal-card p-8 text-sm text-muted lg:col-span-2">
              No ElevenLabs audio files found in the cache yet. Run the live
              agent integration demo to see generated assets.
            </div>
          )}
        </div>
      </section>

      {/* Receipts Table */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-border-low pb-4 gap-4">
          <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-widest text-cream">
            Proof of Consent Receipts
          </h3>
          <span className="stamp-badge text-xs text-muted">
            Solana Devnet Index
          </span>
        </div>
        <div className="postal-card p-8">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div className="space-y-2">
              <p className="font-headline text-2xl font-bold text-cream">
                Awaiting Agent Checkout Events
              </p>
              <p className="text-sm text-muted">
                Proof of Consent receipts will appear here as agents execute
                x402-style settlements. x402 handles the payment, Sello records
                the consent, and Aval shows the revenue.
              </p>
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                Live treasury indexing is not enabled in this demo. The console
                is wired to show paid usage and receipts as Sello events are
                recorded on Solana devnet.
              </p>
            </div>
            <a
              href={`https://explorer.solana.com/address/${SELLO_PROGRAM_ID}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
              className="stamp-badge w-fit text-primary"
            >
              View Program
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function CreatorDashboardWrapper() {
  const [articles] = useState([
    {
      url: DEMO_ARTICLE_PATH,
      pda: "CDPPzRN3eeNiSABBiBZVXpUK4uxUAY8wBRemhfGHu2Ug",
      license: "sello-voice",
    },
  ]);

  return (
    <CreatorDashboardView
      articles={articles}
      onRegisterNew={() => (window.location.href = "/register")}
    />
  );
}
