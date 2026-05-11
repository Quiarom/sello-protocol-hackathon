/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import logo from "./assets/logo.jpg";
import Link from "next/link";

const LICENSE_TYPES = [
  { id: "sello-free", label: "Sello Free", color: "text-green-ink", border: "border-green-ink/30", bg: "bg-green-ink/5", desc: "Attribution only. Free for any use." },
  { id: "sello-nc", label: "Sello NC", color: "text-gold", border: "border-gold/30", bg: "bg-gold/5", desc: "Free for humans. Companies pay." },
  { id: "sello-voice", label: "Sello Voice", color: "text-primary", border: "border-primary/30", bg: "bg-primary/5", desc: "Read free. Narration via micropayment." },
  { id: "sello-pay", label: "Sello Pay", color: "text-orange-400", border: "border-orange-400/30", bg: "bg-orange-400/5", desc: "All AI use requires payment." },
  { id: "sello-no-train", label: "No Train", color: "text-red-400", border: "border-red-400/30", bg: "bg-red-400/5", desc: "Use allowed. Training prohibited." },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Add the Tag",
    desc: "Paste one meta tag in your article's <head>. Declares license, price, and your Solana address.",
    code: `<meta name="sello"\n  content="license:sello-voice|\n  pay:https://server/narrate|\n  price_usdc:0.10|\n  onchain:solana:devnet:...">`,
  },
  {
    step: "02",
    title: "AI Detects & Pays",
    desc: "Any AI agent that reads your content checks the Sello tag. If it wants to narrate, it triggers an x402 USDC micropayment automatically.",
    code: `// AI agent flow\nGET article → parse <meta name="sello">\nif (license === "sello-voice") {\n  POST /narrate + x402 USDC payment\n}`,
  },
  {
    step: "03",
    title: "Recorded On-Chain",
    desc: "Every usage is logged on Solana devnet as an immutable UsageReceipt. Legal proof of consent. Fire-and-forget.",
    code: `// Solana PDA\n["sello", author, content_hash]\n→ ContentSello account\n→ UsageReceipt account\n   amount_paid: 100000 // $0.10 USDC`,
  },
];

export default function Home() {
  return (
    <main className="overflow-x-clip">
      {/* ── HERO ── compact so CTAs are always above fold */}
      <section className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-center gap-10 px-6 py-10 md:grid-cols-[1.15fr_0.85fr] md:gap-16 md:px-12 md:py-12">
        {/* Left */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <span className="stamp-badge text-primary animate-in fade-in slide-in-from-left-4 duration-700">
              The Machine-Readable Rights Layer for AI
            </span>
            <h1 className="font-headline text-5xl font-black uppercase leading-[0.9] tracking-tight text-cream sm:text-6xl lg:text-7xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Your Content.<br />
              <span className="text-primary underline decoration-primary/20 decoration-4 underline-offset-4 italic">Your Terms.</span><br />
              Enforced by Code.
            </h1>
          </div>

          <p className="max-w-lg text-base leading-relaxed text-muted md:text-lg animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-100">
            Sello is the <strong className="text-cream">MIT License for AI content</strong> — one{" "}
            <code className="font-mono text-primary text-sm bg-primary/10 px-1 py-0.5">&lt;meta name="sello"&gt;</code>{" "}
            tag that tells every AI agent what it can do with your work, and collects{" "}
            <strong className="text-cream">automatic USDC micropayments</strong> when they comply.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            <Link href="/register" className="stamp-button text-xl px-10 py-4 group">
              I'm a Creator
              <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link href="/onboarding/agent" className="stamp-button stamp-button-secondary text-xl px-10 py-4">
              I'm an AI Developer
            </Link>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap gap-6 pt-2 animate-in fade-in duration-1000 delay-300">
            {[
              { val: "5", label: "License types" },
              { val: "x402", label: "Payment standard" },
              { val: "Solana", label: "On-chain proof" },
            ].map(({ val, label }) => (
              <div key={label} className="flex items-baseline gap-2">
                <span className="font-display text-2xl text-primary">{val}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — postal card visual */}
        <div className="relative mx-auto w-full max-w-lg animate-in fade-in zoom-in-95 duration-1000 delay-150 hidden md:block">
          <div className="absolute -inset-8 rotate-3 border border-border-low opacity-30" />
          <div className="postal-card relative rotate-[-1.5deg] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] border-primary/25">
            <div className="airmail-stripe h-1.5" />
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image src={logo} alt="Sello" width={36} height={36} className="stamp-image h-9 w-9 object-cover" />
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-gold">Asilo Digital</p>
                    <p className="font-headline text-sm font-bold text-cream">Sello Voice License</p>
                  </div>
                </div>
                <span className="stamp-badge text-[9px] text-green-ink border-green-ink/30 bg-green-ink/10">ACTIVE</span>
              </div>

              {/* Meta tag display */}
              <div className="overflow-x-auto bg-background border border-border-low p-3 font-mono text-[9px] leading-relaxed text-muted/80">
                <span className="text-muted/50">&lt;meta </span>
                <span className="text-primary/80">name</span>
                <span className="text-muted/50">="sello" </span>
                <span className="text-primary/80">content</span>
                <span className="text-muted/50">="</span>
                <br />
                <span className="pl-3 text-cream/70">id:8xK2mN|</span>
                <br />
                <span className="pl-3 text-gold/80">license:sello-voice|</span>
                <br />
                <span className="pl-3 text-cream/70">author:Daniel Patete|</span>
                <br />
                <span className="pl-3 text-primary/80">pay:https://sello.dev/api/narrate|</span>
                <br />
                <span className="pl-3 text-cream/50">price_usdc:0.10</span>
                <span className="text-muted/50">"&gt;</span>
              </div>

              {/* Ledger */}
              <div className="grid grid-cols-2 gap-2 font-mono text-[10px] border-t border-border-low pt-4">
                <div className="space-y-2">
                  <p className="text-muted uppercase tracking-wider text-[8px]">License</p>
                  <p className="text-primary font-bold">Sello Voice</p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted uppercase tracking-wider text-[8px]">Price / Use</p>
                  <p className="text-gold font-bold">$0.10 USDC</p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted uppercase tracking-wider text-[8px]">Payment</p>
                  <p className="text-cream">x402 Auto</p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted uppercase tracking-wider text-[8px]">Recorded</p>
                  <p className="text-green-ink font-bold">On Solana</p>
                </div>
              </div>
            </div>
            <div className="airmail-stripe h-1.5" />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="border-y border-border-low bg-card/20 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-14 text-center space-y-3">
            <span className="stamp-badge text-gold mx-auto w-fit uppercase text-[10px] tracking-widest">Protocol Flow</span>
            <h2 className="font-headline text-4xl md:text-5xl font-black uppercase text-cream tracking-tight">
              How Sello Works
            </h2>
            <p className="text-muted text-base max-w-xl mx-auto">
              From article to AI payment in three steps. No SDK, no API key, no agreement. Just a tag in your HTML.
            </p>
          </div>

          <div className="grid gap-0 md:grid-cols-3">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className={`relative p-8 md:p-10 space-y-5 ${i < 2 ? "md:border-r border-border-low" : ""} ${i > 0 ? "border-t md:border-t-0 border-border-low" : ""}`}>
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-5xl text-primary/20">{item.step}</span>
                  <h3 className="font-headline text-2xl font-bold text-cream">{item.title}</h3>
                </div>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                <div className="bg-background border border-border-low p-4 font-mono text-[10px] leading-relaxed text-muted/70 whitespace-pre overflow-x-auto">
                  {item.code}
                </div>
                {i < 2 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center bg-card border border-border-low text-primary font-display text-sm">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR WHOM ── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-px border border-border-low bg-border-low overflow-hidden">
            {/* Creators */}
            <div className="bg-card/60 p-10 md:p-14 space-y-8">
              <div className="space-y-3">
                <span className="stamp-badge text-primary uppercase text-[10px] tracking-widest">For Creators</span>
                <h3 className="font-headline text-4xl font-black uppercase text-cream leading-tight">
                  Define Your<br />
                  <span className="text-primary italic underline decoration-2 underline-offset-4">AI Terms</span>
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  { icon: "⬡", text: "One meta tag. Machine-readable license that every AI agent respects." },
                  { icon: "$", text: "Automatic USDC micropayments via x402 — no invoices, no chasing." },
                  { icon: "◈", text: "Immutable proof of authorship on Solana devnet. Legal paper trail." },
                  { icon: "§", text: "Covered under EU CDSM Art. 4 TDM reservation." },
                ].map(({ icon, text }) => (
                  <li key={text} className="flex gap-4 items-start">
                    <span className="font-display text-primary text-lg mt-0.5 shrink-0">{icon}</span>
                    <p className="text-sm text-muted leading-relaxed">{text}</p>
                  </li>
                ))}
              </ul>
              <Link href="/register" className="stamp-button inline-flex px-8 py-4 group">
                Seal My Content
                <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

            {/* AI Developers */}
            <div className="bg-card/30 p-10 md:p-14 space-y-8">
              <div className="space-y-3">
                <span className="stamp-badge text-gold uppercase text-[10px] tracking-widest">For AI Developers</span>
                <h3 className="font-headline text-4xl font-black uppercase text-cream leading-tight">
                  Access Licensed<br />
                  <span className="text-gold italic underline decoration-2 underline-offset-4">AI-Ready Content</span>
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  { icon: "⬡", text: "Detect Sello tags in any HTML. Instant knowledge of what you can do." },
                  { icon: "$", text: "Pay-per-use via x402. No contracts, no negotiations, no legal risk." },
                  { icon: "◈", text: "Sello Skill works in Claude Code, Codex, Gemini CLI out of the box." },
                  { icon: "§", text: "Cross-chain: arrive with USDC from any chain via LI.FI bridge." },
                ].map(({ icon, text }) => (
                  <li key={text} className="flex gap-4 items-start">
                    <span className="font-display text-gold text-lg mt-0.5 shrink-0">{icon}</span>
                    <p className="text-sm text-muted leading-relaxed">{text}</p>
                  </li>
                ))}
              </ul>
              <Link href="/onboarding/agent" className="stamp-button-secondary inline-flex px-8 py-4 group border border-gold text-gold hover:bg-gold hover:text-background">
                Setup My Agent
                <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── LICENSE TYPES ── */}
      <section className="border-y border-border-low bg-card/20 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="stamp-badge text-primary uppercase text-[10px] tracking-widest">Pre-Defined Licenses</span>
              <h2 className="font-headline text-4xl md:text-5xl font-black uppercase text-cream tracking-tight">
                5 Licenses.<br />Zero Lawyers.
              </h2>
            </div>
            <p className="text-muted text-sm max-w-xs leading-relaxed">
              Like Creative Commons, but for AI agents. Machine-readable, on-chain verifiable, micropayment-enabled.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {LICENSE_TYPES.map((l) => (
              <div key={l.id} className={`postal-card ${l.border} ${l.bg} p-6 space-y-3 group hover:scale-[1.02] transition-transform duration-300`}>
                <p className={`font-display text-xl uppercase tracking-widest ${l.color}`}>{l.label}</p>
                <p className="text-xs text-muted leading-relaxed">{l.desc}</p>
                <p className={`font-mono text-[9px] uppercase tracking-wider ${l.color} opacity-60`}>{l.id}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE TAG EXAMPLE ── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6 md:px-12">
          <div className="postal-card p-8 md:p-14 space-y-8 border-primary/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="stamp-badge text-primary uppercase text-[10px] tracking-widest">Live Example</span>
                <h3 className="font-headline text-3xl font-black uppercase text-cream">
                  One Tag to Rule Them All
                </h3>
                <p className="text-sm text-muted">
                  Asilo Digital — 2,700+ articles shielded with one line of HTML.
                </p>
              </div>
              <div className="postmark flex h-20 w-20 shrink-0 -rotate-6 items-center justify-center text-center text-[7px] font-black leading-tight border-primary/30 text-primary/60">
                VERIFIED<br />SOLANA
              </div>
            </div>

            <div className="bg-background border border-primary/20 relative group">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="p-6 font-mono text-[11px] md:text-sm leading-relaxed text-muted overflow-x-auto">
                <span className="text-muted/50">&lt;</span>
                <span className="text-primary">meta</span>
                <span className="text-cream"> name</span>
                <span className="text-muted/50">=</span>
                <span className="text-gold">"sello"</span>
                <span className="text-cream"> content</span>
                <span className="text-muted/50">=</span>
                <span className="text-gold">"</span>
                <br />
                <span className="pl-4 text-green-ink">id:8xK2mN</span><span className="text-muted/40">|</span>
                <span className="text-primary">license:sello-voice</span><span className="text-muted/40">|</span>
                <br />
                <span className="pl-4 text-cream">author:Daniel Patete</span><span className="text-muted/40">|</span>
                <span className="text-cream">publisher:Asilo Digital</span><span className="text-muted/40">|</span>
                <br />
                <span className="pl-4 text-primary">pay:https://sello.dev/api/narrate</span><span className="text-muted/40">|</span>
                <br />
                <span className="pl-4 text-muted">onchain:solana:devnet:2NDZJtmAN44AMtTUBDd56zR2so...</span><span className="text-muted/40">|</span>
                <br />
                <span className="pl-4 text-gold">price_usdc:0.10</span>
                <span className="text-gold">"</span>
                <span className="text-muted/50">&gt;</span>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3 text-center border-t border-border-low pt-8">
              {[
                { label: "AI reads article", sub: "Parses meta tag", icon: "👁" },
                { label: "Pays $0.10 USDC", sub: "x402 automatic", icon: "⚡" },
                { label: "Receipt on Solana", sub: "Immutable proof", icon: "◈" },
              ].map(({ label, sub, icon }) => (
                <div key={label} className="space-y-2">
                  <div className="text-2xl">{icon}</div>
                  <p className="font-display text-sm uppercase tracking-widest text-cream">{label}</p>
                  <p className="font-mono text-[10px] text-muted">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="border-t border-border-low bg-card/20 py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center space-y-10">
          <div className="space-y-4">
            <p className="font-display text-4xl md:text-5xl uppercase tracking-widest text-cream">
              Ready to shield<br />
              <span className="text-primary">your content?</span>
            </p>
            <p className="mx-auto max-w-lg text-base text-muted italic leading-relaxed">
              "Every great work deserves a seat at the AI table —<br />
              with terms defined by the creator, not the scraper."
            </p>
          </div>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/register" className="stamp-button px-12 py-4 text-xl group">
              Creator Onboarding
              <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link href="/onboarding/agent" className="stamp-button stamp-button-secondary px-12 py-4 text-xl">
              AI Developer Tools
            </Link>
          </div>
          <div className="space-y-2 pt-4">
            <div className="flex flex-wrap justify-center gap-6 text-[10px] font-mono uppercase tracking-widest text-muted">
              <span>Solana Devnet ✓</span>
              <span>x402 Standard ✓</span>
              <span>ElevenLabs Voice ✓</span>
              <span>EU CDSM Art. 4 ✓</span>
            </div>
            <div className="flex flex-col items-center gap-2 pt-4">
              <a href="https://x.com/selloprotocol" target="_blank" rel="noreferrer" className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted/50 hover:text-primary transition-colors">
                @selloprotocol on X/Twitter
              </a>
              <a href="https://github.com/Quiarom/sello-protocol" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-muted/50 hover:text-primary transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                Open Source on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
