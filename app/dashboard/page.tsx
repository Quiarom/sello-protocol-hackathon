"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useWallet } from "@/app/lib/wallet/context";
import { ellipsify } from "@/app/lib/explorer";
import { CreatorDashboardView } from "@/app/components/dashboard/CreatorDashboardView";
import { selloDemoArticle } from "@/app/lib/sello/constants";

type NarrationFile = {
  id: string;
  name: string;
  audioUrl: string;
  createdAt: string;
  sizeOriginal: number;
};

type LastAgentDemo = {
  articleUrl: string;
  title: string;
  author: string;
  publisher: string;
  license: string | null;
  priceUSDC: number;
  attribution: string;
  contentSelloPDA: string | null;
  walletAddress: string;
  signature: string;
  audioUrl: string | null;
  inlineAudio: string | null;
  mimeType: string;
  voiceId?: string;
  createdAt: string;
};

const SELLO_PROGRAM_ID = "3P8km3sUTKc5EZywxVxPoFFFJzPxWGjVHtKLSU2iy7mY";
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
  const [lastDemo, setLastDemo] = useState<LastAgentDemo | null>(null);

  useEffect(() => {
    let isMounted = true;

    const cachedDemo = window.localStorage.getItem("sello:last-agent-demo");
    if (cachedDemo) {
      try {
        setLastDemo(JSON.parse(cachedDemo) as LastAgentDemo);
      } catch {
        window.localStorage.removeItem("sello:last-agent-demo");
      }
    }

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

  const latestNarrationUrl =
    lastDemo?.audioUrl ?? lastDemo?.inlineAudio ?? narrations[0]?.audioUrl;
  const latestNarrationLabel =
    lastDemo?.voiceId ?? narrations[0]?.name ?? "ElevenLabs narration";
  const demoArticleUrl = lastDemo?.articleUrl ?? DEMO_ARTICLE_PATH;
  const demoContentPda =
    lastDemo?.contentSelloPDA ?? selloDemoArticle.contentPda;
  const demoPrice = lastDemo?.priceUSDC ?? 0.1;
  const demoLicense = lastDemo?.license ?? selloDemoArticle.license;
  const demoWallet =
    lastDemo?.walletAddress ?? selloDemoArticle.publisher.walletAddress;

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
            Agent Requests
          </p>
          <p className="font-headline text-3xl md:text-4xl font-black text-gold mt-2">
            {lastDemo ? 1 : 0}
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

      <section className="postal-card overflow-hidden border-gold/30 bg-gold/[0.02]">
        <div className="border-b border-border-low bg-gold/10 p-4">
          <p className="font-mono text-xs font-black uppercase tracking-widest text-gold">
            Demo Article Rights Checkout
          </p>
        </div>
        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] sm:p-8">
          <div className="space-y-5">
            <div>
              <p className="font-display text-2xl uppercase tracking-widest text-cream">
                {selloDemoArticle.title}
              </p>
              <p className="mt-2 max-w-2xl text-sm text-muted">
                Publisher-created Rights Checkout for the protected demo
                article. The agent reads this record, pays for voice usage, and
                leaves a Proof of Consent as a Solana devnet UsageReceipt.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoPill
                label="Article"
                value={demoArticleUrl}
                href={demoArticleUrl}
              />
              <InfoPill label="License" value={demoLicense} />
              <InfoPill label="Price" value={`$${demoPrice.toFixed(2)} USDC`} />
              <InfoPill
                label="Publisher"
                value={selloDemoArticle.publisher.name}
              />
              <InfoPill
                label="Author"
                value={lastDemo?.author ?? selloDemoArticle.author}
              />
              <InfoPill
                label="Agent wallet"
                value={demoWallet}
                href={`https://explorer.solana.com/address/${demoWallet}?cluster=devnet`}
              />
              <InfoPill
                label="ContentSello PDA"
                value={demoContentPda}
                href={`https://explorer.solana.com/address/${demoContentPda}?cluster=devnet`}
              />
              {lastDemo?.signature ? (
                <InfoPill
                  label="Latest transaction"
                  value={lastDemo.signature}
                  href={`https://explorer.solana.com/tx/${lastDemo.signature}?cluster=devnet`}
                />
              ) : null}
            </div>
          </div>

          <div className="postal-card border-primary/20 bg-background/50 p-5">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              ElevenLabs audio
            </p>
            <p className="mt-2 break-all text-sm text-cream">
              {latestNarrationUrl
                ? latestNarrationLabel
                : "No generated narration yet"}
            </p>
            {latestNarrationUrl ? (
              <>
                <audio
                  controls
                  preload="metadata"
                  src={latestNarrationUrl}
                  className="mt-4 w-full accent-primary"
                />
                {lastDemo?.createdAt ? (
                  <p className="mt-3 font-mono text-xs uppercase tracking-[0.12em] text-muted">
                    Generated {new Date(lastDemo.createdAt).toLocaleString()}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-4 text-sm text-muted">
                Run the Agent Demo after configuring ElevenLabs to attach the
                generated audio here.
              </p>
            )}
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
                {lastDemo
                  ? "Latest Solana devnet UsageReceipt"
                  : "Awaiting Agent Checkout Events"}
              </p>
              <p className="text-sm text-muted">
                {lastDemo
                  ? "The latest Agent Demo produced an x402-style payment transaction and requested narration unlock. This is devnet evidence, not legal ownership proof."
                  : "Proof of Consent receipts will appear here as agents execute x402-style settlements. x402 handles the payment, Sello records the consent, and Aval shows the revenue."}
              </p>
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                {lastDemo
                  ? `Tx: ${lastDemo.signature}`
                  : "Live treasury indexing is not enabled in this demo. The console is wired to show paid usage and receipts as Sello events are recorded on Solana devnet."}
              </p>
            </div>
            <a
              href={
                lastDemo
                  ? `https://explorer.solana.com/tx/${lastDemo.signature}?cluster=devnet`
                  : `https://explorer.solana.com/address/${SELLO_PROGRAM_ID}?cluster=devnet`
              }
              target="_blank"
              rel="noreferrer"
              className="stamp-badge w-fit text-primary"
            >
              {lastDemo ? "View Transaction" : "View Program"}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoPill({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="block font-mono text-[10px] uppercase tracking-widest text-muted">
        {label}
      </span>
      <span className="mt-1 block break-all font-mono text-xs text-cream">
        {value}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer" : undefined}
        className="border border-border-low bg-background/40 p-3 transition-colors hover:border-primary/40"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="border border-border-low bg-background/40 p-3">
      {content}
    </div>
  );
}

function CreatorDashboardWrapper() {
  const [articles] = useState([
    {
      url: DEMO_ARTICLE_PATH,
      pda: "AbBDUHP6sa4bS7cUVhxFaCTSr5Pw3tv42yno7FRaSf4S",
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
