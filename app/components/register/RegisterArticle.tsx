"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@/app/lib/wallet/context";
import { useSendTransaction } from "@/app/lib/hooks/use-send-transaction";
import {
  getRegisterSelloInstructionAsync,
  findSelloPda,
  getInitializeConfigInstructionAsync,
  findConfigPda,
} from "@/app/generated/sello";
import type { Address } from "@solana/kit";
import { ellipsify } from "@/app/lib/explorer";
import { toast } from "sonner";
import { CreatorDashboardView } from "@/app/components/dashboard/CreatorDashboardView";
import { useBalance } from "@/app/lib/hooks/use-balance";
import { WalletButton } from "../wallet-button";

// devnet USDC mint (Circle)
const DEVNET_USDC_MINT =
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU" as Address;

const USE_SUMMARIZE = 1 << 0;
const USE_QUOTE = 1 << 1;
const USE_VOICE = 1 << 2;
const USE_TRAIN = 1 << 3;

const LICENSE_MODES: Record<
  string,
  {
    title: string;
    description: string;
    allowedUses: number;
    paidUse: boolean;
    trainingAllowed: boolean;
    color: string;
  }
> = {
  "sello-free": {
    title: "Sello Open",
    description:
      "Free use with mandatory attribution. Ideal for personal blogs.",
    allowedUses: USE_SUMMARIZE | USE_QUOTE | USE_VOICE | USE_TRAIN,
    paidUse: false,
    trainingAllowed: true,
    color: "text-green-ink",
  },
  "sello-voice": {
    title: "Sello Voice",
    description:
      "Reading is free, but high-quality narration requires a micropayment.",
    allowedUses: USE_SUMMARIZE | USE_QUOTE | USE_VOICE,
    paidUse: true,
    trainingAllowed: false,
    color: "text-primary",
  },
  "sello-nc": {
    title: "Sello Non-Commercial",
    description: "Free for humans, but companies must pay to use your content.",
    allowedUses: USE_SUMMARIZE | USE_QUOTE | USE_VOICE,
    paidUse: true,
    trainingAllowed: false,
    color: "text-gold",
  },
  "sello-pay": {
    title: "Sello Protected",
    description: "Maximum protection. Any AI use requires prior payment.",
    allowedUses: USE_SUMMARIZE | USE_QUOTE | USE_VOICE,
    paidUse: true,
    trainingAllowed: false,
    color: "text-red-500",
  },
};

type Step = "setup" | "register" | "implementation" | "dashboard";
type TechStack =
  | "nextjs"
  | "astro"
  | "wordpress"
  | "ghost"
  | "substack"
  | "generic";

const STACK_INFO: Record<
  TechStack,
  { name: string; icon: string; bg: string; color: string }
> = {
  nextjs: { name: "Next.js", icon: "▲", bg: "bg-white", color: "text-black" },
  astro: {
    name: "Astro",
    icon: "🚀",
    bg: "bg-orange-500",
    color: "text-white",
  },
  wordpress: {
    name: "WordPress",
    icon: "W",
    bg: "bg-blue-600",
    color: "text-white",
  },
  ghost: { name: "Ghost", icon: "G", bg: "bg-black", color: "text-white" },
  substack: {
    name: "Substack",
    icon: "S",
    bg: "bg-orange-600",
    color: "text-white",
  },
  generic: { name: "HTML", icon: "</>", bg: "bg-card", color: "text-muted" },
};

export function RegisterArticle() {
  const { signer, status, connectors, connect } = useWallet();
  const { send, isSending } = useSendTransaction();
  const walletBalance = useBalance(signer?.address);

  // Fix Hydration Mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [step, setStep] = useState<Step>("setup");
  const [articleUrl, setArticleUrl] = useState("");
  const [license, setLicense] = useState("sello-voice");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [priceUSDC, setPriceUSDC] = useState("0.10");

  const [voiceType, setVoiceType] = useState<"standard" | "cloned">("standard");
  const [customVoiceId, setCustomVoiceId] = useState("");

  const [configExists, setConfigExists] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const [registeredArticles, setRegisteredArticles] = useState<any[]>([]);

  const [lastResult, setLastResult] = useState<{
    pda: string;
    signature: string;
    metaTag: string;
    metaTagValue: string;
    files: { llms: string; tdm: string; rsl: string };
    url: string;
  } | null>(null);

  const [serverUrl, setServerUrl] = useState("");
  useEffect(() => {
    setServerUrl(window.location.origin);
  }, []);

  useEffect(() => {
    if (status === "connected" && signer) {
      void checkConfigStatus();
    }
  }, [status, signer]);

  const checkConfigStatus = async () => {
    if (!signer) return;
    const exists = await checkConfigExists(signer.address);
    setConfigExists(exists);
    if (exists) setStep("register");
  };

  const handleInitProfile = async () => {
    if (!signer) return;
    setIsInitializing(true);
    try {
      const instruction = await getInitializeConfigInstructionAsync({
        authority: signer,
        feeBps: 500,
        treasury: signer.address,
        usdcMint: DEVNET_USDC_MINT,
      });
      await send({ instructions: [instruction] });
      setConfigExists(true);
      setStep("register");
      toast.success("Creator profile activated!");
    } catch (err) {
      console.error("Profile initialization failed:", err);
      toast.error("Could not activate profile. Make sure you have Devnet SOL.");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSellar = async () => {
    if (!signer) return;
    try {
      const contentHash = await sha256(articleUrl);
      const [pda] = await findSelloPda({ author: signer.address, contentHash });

      const exists = await checkAccountExists(pda);

      let signature = "";
      if (exists) {
        toast.info("Article already published! Loading existing record...");
      } else {
        const licenseConfig = LICENSE_MODES[license];
        const basePriceUnits = BigInt(
          Math.round(parseFloat(priceUSDC) * 1_000_000)
        );

        const instruction = await getRegisterSelloInstructionAsync({
          author: signer,
          contentHash,
          termsCid: new Uint8Array(46).fill(0),
          termsHash: await sha256("{}"),
          allowedUses: licenseConfig.allowedUses,
          basePrice: basePriceUnits,
        });

        signature = await send({ instructions: [instruction] });
      }

      const voiceIdParam =
        voiceType === "cloned" ? customVoiceId : "Rachel (Default)";
      const metaTagValue = `id:${pda.slice(0, 6)}|license:${license}|author:${author || "Author"}|publisher:${publisher || "Publisher"}|pay:${serverUrl}/api/narrate|onchain:solana:devnet:${pda}|price_usdc:${priceUSDC}|voice_id:${voiceIdParam}`;
      const metaTag = `<meta name="sello" content="${metaTagValue}">`;

      const resultData = {
        url: articleUrl,
        pda,
        signature: signature || "existing",
        metaTag,
        metaTagValue,
        license,
        author: author || "Author",
        publisher: publisher || "Publisher",
        files: buildPolicyFiles({
          author,
          publisher,
          license,
          pda,
          priceUSDC,
          serverUrl,
          voiceId: voiceIdParam,
        }),
      };

      setLastResult(resultData);
      setRegisteredArticles((prev) => {
        if (prev.some((a) => a.pda === pda)) return prev;
        return [resultData, ...prev];
      });
      setStep("implementation");
      if (!exists) toast.success("Article successfully published!");
    } catch (err) {
      console.error("Publishing failed:", err);
      toast.error("Error registering article. Check console for details.");
    }
  };

  const handleRegisterNew = () => {
    setArticleUrl("");
    setLastResult(null);
    setStep("register");
  };

  return (
    <main className="overflow-x-clip border-t border-border-low bg-card/10">
      <div className="mx-auto max-w-7xl border-x border-border-low bg-background/20 px-4 py-8 sm:px-6 md:px-8 lg:px-12 lg:py-16 space-y-8 md:space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="stamp-badge text-primary mx-auto w-fit font-display uppercase tracking-widest">
            Sello Protocol
          </span>
          <h1 className="font-headline text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tight text-cream">
            {step === "setup" && "Publisher Identity"}
            {step === "register" && "Define Rules & Price"}
            {step === "implementation" && "Publish AI-readable Rules"}
            {step === "dashboard" && "View Evidence in Aval"}
          </h1>
          <p className="text-muted text-base md:text-lg max-w-2xl mx-auto">
            {step === "setup" &&
              "Aval connects its publisher wallet to establish authority over the content hash."}
            {step === "register" &&
              "Aval creates rules for an article. These rules will be read by agents later to automate their usage permissions."}
            {step === "implementation" &&
              "The app generates machine-readable signals so agents can detect, pay, and leave a UsageReceipt."}
            {step === "dashboard" &&
              "Monitor agent requests, recorded Proof of Consent, and your total rights revenue."}
          </p>
        </div>

        {step === "setup" && (
          <div className="postal-card p-6 sm:p-10 md:p-16 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="grid gap-12 md:grid-cols-2">
              <div className="space-y-6">
                <p className="font-display text-3xl uppercase tracking-widest text-primary">
                  Step 1: Publisher Identity
                </p>
                <p className="text-muted leading-relaxed">
                  Aval connects its publisher wallet so that automated AI
                  payments go directly to your newsroom treasury.
                </p>

                {!mounted ? (
                  <div className="h-14 w-full animate-pulse bg-card border border-border-low" />
                ) : status !== "connected" ? (
                  <div className="flex flex-col items-center justify-center p-8 bg-background/40 border border-dashed border-border-low space-y-4">
                    <div className="p-4 bg-primary/5 rounded-full">
                      <svg
                        className="h-8 w-8 text-primary/40"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="font-headline text-lg font-bold text-cream">
                        Wallet Not Connected
                      </p>
                      <p className="text-xs text-muted uppercase tracking-widest">
                        Identify yourself as a content authority
                      </p>
                    </div>
                    <div className="pt-2">
                      <WalletButton />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in zoom-in-95">
                    <div className="flex items-center gap-4 bg-background/80 p-5 border border-primary/30">
                      <span className="h-2 w-2 rounded-full bg-green-ink animate-pulse shadow-[0_0_8px_#00e38b]" />
                      <div className="flex flex-col">
                        <span className="font-mono text-xs uppercase text-muted tracking-widest">
                          Confirmed Authority
                        </span>
                        <span className="font-mono text-xs text-cream break-all">
                          {signer?.address}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-2 text-xs font-mono">
                      <span className="text-muted uppercase tracking-tighter">
                        Liquidity:
                      </span>
                      <span className="text-gold font-bold">
                        {walletBalance.lamports != null
                          ? (
                              Number(walletBalance.lamports) / 1_000_000_000
                            ).toFixed(4)
                          : "..."}{" "}
                        SOL
                      </span>
                    </div>
                    {walletBalance.lamports === 0n && (
                      <a
                        href="https://faucet.solana.com/"
                        target="_blank"
                        className="stamp-badge w-full justify-center bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all py-2"
                      >
                        Fund Wallet (Devnet Faucet) ↗
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-primary/5 p-8 border border-dashed border-primary/20 space-y-4">
                <p className="font-headline text-xl font-bold italic text-gold">
                  Why Sello?
                </p>
                <ul className="text-xs text-muted space-y-3 list-disc pl-4">
                  <li>
                    Machine-readable rights signaling aware of EU CDSM Art. 4.
                  </li>
                  <li>
                    Automatic x402-style settlements every time an AI agent uses
                    your content.
                  </li>
                  <li>
                    Record immutable Proof of Consent on the Solana blockchain.
                  </li>
                </ul>
              </div>
            </div>
            {mounted && status === "connected" && configExists === false && (
              <div className="pt-6 border-t border-border-low">
                <button
                  onClick={handleInitProfile}
                  disabled={isInitializing}
                  className="stamp-button w-full py-5 text-2xl group"
                >
                  {isInitializing
                    ? "Activating Profile..."
                    : "Activate my Creator Profile"}
                  {!isInitializing && (
                    <svg
                      className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {step === "register" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="postal-card p-6 sm:p-8 md:p-12 space-y-8">
              <div className="grid gap-8 md:grid-cols-2">
                <label className="block space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                      Article URL
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setArticleUrl(
                          `${window.location.origin}/blog/protected-article`
                        )
                      }
                      className="text-xs font-mono text-primary uppercase hover:underline"
                    >
                      Try Demo URL
                    </button>
                  </div>
                  <input
                    type="url"
                    value={articleUrl}
                    onChange={(e) => setArticleUrl(e.target.value)}
                    placeholder="https://yourweb.com/exclusive-article"
                    className="postal-input text-base sm:text-lg"
                  />
                </label>
                <label className="block space-y-3">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                    Author or Publisher
                  </span>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Daniel Patete"
                    className="postal-input text-base sm:text-lg"
                  />
                </label>
              </div>
              <div className="space-y-4">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted block">
                  Choose Rights Signal
                </span>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(LICENSE_MODES).map(([id, cfg]) => (
                    <button
                      key={id}
                      onClick={() => setLicense(id)}
                      className={`text-left p-6 border transition-all duration-300 ${license === id ? "bg-primary/5 border-primary ring-1 ring-primary shadow-lg" : "bg-background/20 border-border-low hover:border-muted"}`}
                    >
                      <p
                        className={`font-headline text-xl font-bold ${cfg.color}`}
                      >
                        {cfg.title}
                      </p>
                      <p className="text-xs text-muted mt-2 leading-relaxed">
                        {cfg.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              {license === "sello-voice" && (
                <div className="p-8 bg-primary/[0.02] border border-primary/20 space-y-6">
                  <div className="space-y-1">
                    <p className="font-headline text-xl font-bold text-cream">
                      Voice Identity (ElevenLabs)
                    </p>
                    <p className="text-xs text-muted">
                      Select the authorized voice for your content narration.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <button
                      onClick={() => setVoiceType("standard")}
                      className={`p-4 border text-left transition-all ${voiceType === "standard" ? "border-primary bg-primary/10" : "border-border-low opacity-60"}`}
                    >
                      <p className="font-bold text-xs uppercase tracking-widest text-primary">
                        Standard Narrator
                      </p>
                      <p className="text-xs text-muted mt-1">
                        High-quality professional voice (Rachel).
                      </p>
                    </button>
                    <button
                      onClick={() => setVoiceType("cloned")}
                      className={`p-4 border text-left transition-all ${voiceType === "cloned" ? "border-gold bg-gold/10" : "border-border-low opacity-60"}`}
                    >
                      <p className="font-bold text-xs uppercase tracking-widest text-gold">
                        My Cloned Voice
                      </p>
                      <p className="text-xs text-muted mt-1">
                        Requires an ElevenLabs Voice ID.
                      </p>
                    </button>
                  </div>
                  {voiceType === "cloned" && (
                    <div className="animate-in slide-in-from-top-2">
                      <label className="block space-y-2">
                        <span className="font-mono text-xs uppercase text-gold">
                          ElevenLabs Voice ID
                        </span>
                        <input
                          type="text"
                          value={customVoiceId}
                          onChange={(e) => setCustomVoiceId(e.target.value)}
                          placeholder="e.g. pNInz6wntMws98En_id"
                          className="postal-input text-sm font-mono border-gold/30 focus:border-gold"
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}
              {LICENSE_MODES[license].paidUse && (
                <div className="animate-in slide-in-from-left-4 flex flex-col gap-6 border border-gold/20 bg-gold/5 p-6 md:flex-row md:items-center">
                  <div className="flex-1">
                    <p className="font-headline text-lg font-bold text-gold">
                      Suggested Price
                    </p>
                    <p className="text-xs text-muted">
                      How much the AI must pay automatically to use this
                      content.
                    </p>
                  </div>
                  <div className="flex w-full items-center gap-3 md:w-auto">
                    <input
                      type="number"
                      step="0.01"
                      value={priceUSDC}
                      onChange={(e) => setPriceUSDC(e.target.value)}
                      className="postal-input w-full max-w-[7rem] text-center text-2xl font-black text-cream"
                    />
                    <span className="font-display text-2xl text-muted">
                      USDC
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => setStep("setup")}
                className="stamp-button-secondary py-3 sm:py-5 px-8 order-2 sm:order-1 text-sm"
              >
                Back
              </button>
              <button
                onClick={handleSellar}
                disabled={isSending || !articleUrl}
                className="stamp-button flex-1 py-4 sm:py-5 text-xl sm:text-2xl order-1 sm:order-2 group"
              >
                {isSending ? "Publishing..." : "Publish Checkout"}
                {!isSending && (
                  <svg
                    className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                )}
              </button>
            </div>
            <div className="bg-background/40 border border-border-low p-4 text-center">
              <p className="text-xs uppercase font-mono tracking-widest text-muted">
                Next Step:{" "}
                <span className="text-gold">
                  Get your Sello Tag & Implementation Files
                </span>
              </p>
            </div>
          </div>
        )}

        {step === "implementation" && lastResult && (
          <ImplementationView
            result={lastResult}
            onFinish={() => setStep("dashboard")}
          />
        )}

        {step === "dashboard" && (
          <CreatorDashboardView
            articles={registeredArticles}
            onRegisterNew={handleRegisterNew}
          />
        )}
      </div>
    </main>
  );
}

function ImplementationView({
  result,
  onFinish,
}: {
  result: any;
  onFinish: () => void;
}) {
  const [activeFile, setActiveFile] = useState<"tag" | "llms" | "tdm" | "rsl">(
    "tag"
  );
  const [stack, setStack] = useState<TechStack>("generic");

  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyLogs, setVerifyLogs] = useState<
    Array<{ type: string; msg: string }>
  >([]);

  const runLiveVerification = async () => {
    setIsVerifying(true);
    setVerifyLogs([
      { type: "system", msg: "Starting site-wide compliance check..." },
    ]);

    await new Promise((r) => setTimeout(r, 800));
    setVerifyLogs((prev) => [
      ...prev,
      { type: "bot", msg: `Crawling article: ${result.url}` },
    ]);

    try {
      const response = await fetch(
        `/api/license?url=${encodeURIComponent(result.url)}`
      );
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Crawl failed");

      await new Promise((r) => setTimeout(r, 600));
      if (data.hasSello) {
        setVerifyLogs((prev) => [
          ...prev,
          { type: "success", msg: "Sello Tag detected in HTML <head>!" },
        ]);
      } else {
        setVerifyLogs((prev) => [
          ...prev,
          {
            type: "warning",
            msg: "Sello Tag not detected. Ensure it's in the <head> and your site allows bots.",
          },
        ]);
      }

      setVerifyLogs((prev) => [
        ...prev,
        { type: "bot", msg: "Scanning domain root for policy files..." },
      ]);
      await new Promise((r) => setTimeout(r, 1000));

      setVerifyLogs((prev) => [
        ...prev,
        {
          type: data.hasLlmsTxt ? "success" : "warning",
          msg: `${data.hasLlmsTxt ? "Detected" : "Missing"} /llms.txt at root.`,
        },
      ]);

      setVerifyLogs((prev) => [
        ...prev,
        {
          type: data.hasTdmPolicy ? "success" : "warning",
          msg: `${data.hasTdmPolicy ? "Detected" : "Missing"} /tdm-policy.json.`,
        },
      ]);

      if (data.hasSello && data.hasLlmsTxt && data.hasTdmPolicy) {
        setVerifyLogs((prev) => [
          ...prev,
          {
            type: "success",
            msg: "All protection layers are active and verified.",
          },
        ]);
        toast.success("Site Verified!");
      } else if (data.hasSello) {
        setVerifyLogs((prev) => [
          ...prev,
          {
            type: "system",
            msg: "Tag is working, but root policy files are missing (recommended).",
          },
        ]);
      }
    } catch (err) {
      setVerifyLogs((prev) => [
        ...prev,
        {
          type: "warning",
          msg: "Verification failed. Check your domain visibility.",
        },
      ]);
    } finally {
      setIsVerifying(false);
    }
  };

  const files = [
    {
      id: "tag",
      name: "1. Sello Tag",
      desc: "The unique HTML identifier for this article.",
      content: result.metaTag,
    },
    {
      id: "llms",
      name: "2. llms.txt",
      desc: "Direct instructions for AI models (Claude, GPT, etc.).",
      content: result.files.llms,
    },
    {
      id: "tdm",
      name: "3. tdm-policy.json",
      desc: "Machine-readable compliance with the EU AI Act.",
      content: result.files.tdm,
    },
    {
      id: "rsl",
      name: "4. rsl.txt",
      desc: "Technical rights signal for advanced crawlers.",
      content: result.files.rsl,
    },
  ];

  const current = files.find((f) => f.id === activeFile)!;

  let displayContent = current.content;
  let customInstructions = "";

  if (activeFile === "tag") {
    if (stack === "nextjs") {
      displayContent = `// In your app/layout.tsx or page.tsx metadata object:
export const metadata = {
  other: {
    sello: '${result.metaTagValue}'
  }
};`;
      customInstructions =
        "Add this to your Next.js metadata object to inject the tag correctly.";
    } else if (stack === "astro") {
      displayContent = `---
// In your Layout.astro head section
---
<meta name="sello" content="${result.metaTagValue}">`;
      customInstructions =
        "Paste this directly into your Astro layout component's <head> section.";
    } else if (stack === "wordpress") {
      customInstructions =
        "1. Install 'WPCode' and paste the tag into Header. 2. IMPORTANT: If using SiteGround or caching plugins, click 'Purge Cache' so the bot can see the tag. 3. Use 'WP File Manager' for policy files.";
    } else if (stack === "ghost") {
      customInstructions =
        "Go to Settings -> Code Injection and paste the tag into the 'Site Header' section.";
    } else if (stack === "substack") {
      customInstructions =
        "Go to Settings -> Advanced -> Head Injection and paste the tag there.";
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="postal-card overflow-hidden">
        <div className="flex overflow-x-auto border-b border-border-low bg-background/50 no-scrollbar">
          {files.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFile(f.id as any)}
              className={`whitespace-nowrap px-5 py-4 font-display text-xs tracking-widest uppercase transition-all sm:px-8 sm:py-5 sm:text-sm ${activeFile === f.id ? "bg-card text-primary border-b-2 border-primary shadow-inner" : "text-muted hover:text-cream"}`}
            >
              {f.name.split(" ")[1]}
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-10 md:p-14 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="font-headline text-2xl sm:text-4xl font-bold text-cream underline decoration-primary decoration-4 underline-offset-8">
                Your AI-readable Rules are Ready
              </h3>
              <p className="text-muted text-base max-w-lg leading-relaxed">
                Choose your technology below to get tailored instructions on how
                to embed your Agent Rights Checkout signals.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full lg:w-auto">
              <span className="font-mono text-xs uppercase text-muted tracking-widest font-bold">
                Select Deployment Stack
              </span>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(STACK_INFO) as TechStack[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStack(s)}
                    className={`flex items-center gap-2 px-3 py-2 border transition-all ${stack === s ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border-low hover:border-muted opacity-60"}`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-sm font-black text-xs ${STACK_INFO[s].bg} ${STACK_INFO[s].color}`}
                    >
                      {STACK_INFO[s].icon}
                    </span>
                    <span className="font-display text-xs uppercase tracking-widest text-cream">
                      {STACK_INFO[s].name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative group max-w-full">
            <div className="absolute -inset-1 bg-primary/20 blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <pre className="relative bg-background border border-border-low p-6 sm:p-10 font-mono text-xs sm:text-sm leading-relaxed text-muted-foreground overflow-auto max-h-[400px] no-scrollbar">
              <code>{displayContent}</code>
            </pre>
            <button
              onClick={() => {
                navigator.clipboard.writeText(displayContent);
                toast.success("Copied to clipboard!");
              }}
              className="absolute right-3 top-3 stamp-badge cursor-pointer bg-card/80 px-3 py-1 text-xs text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:right-4 sm:top-4 sm:px-4"
            >
              Copy All
            </button>
          </div>

          <div className="grid gap-8 md:grid-cols-2 pt-8 border-t border-border-low">
            <div className="space-y-3">
              <p className="font-mono text-xs uppercase text-gold tracking-widest">
                Implementation Guide
              </p>
              <div className="bg-gold/5 border-l-2 border-gold p-4">
                <p className="text-xs text-muted leading-relaxed italic">
                  {customInstructions ||
                    (activeFile === "tag"
                      ? "Copy and paste this code within the <head> section of your article. This enables machine-readable rights checking."
                      : `Upload this file to your domain root folder. It must be publicly accessible at yourdomain.com/${activeFile === "llms" ? "llms.txt" : activeFile === "tdm" ? "tdm-policy.json" : "rsl.txt"}.`)}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-mono text-xs uppercase text-primary tracking-widest">
                Legal Signal
              </p>
              <p className="text-xs text-muted italic leading-relaxed">
                "By publishing these files, you are exercising your right to
                data mining reservation (TDM) under international legal
                frameworks like Art. 4 of the EU DSM Directive."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Validator Section */}
      <section className="postal-card p-6 sm:p-10 space-y-6 border-dashed border-muted/30 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display text-2xl uppercase tracking-widest text-cream">
              Checkout Validator
            </h3>
            <p className="text-xs text-muted">
              Test if your implementation is visible to AI agents.
            </p>
          </div>
          <button
            onClick={runLiveVerification}
            disabled={isVerifying}
            className="stamp-button text-base py-2 group min-w-[200px]"
          >
            {isVerifying ? "Verifying..." : "Run Live Verification"}
            {!isVerifying && (
              <svg
                className="ml-2 h-4 w-4 transition-transform group-hover:rotate-180 duration-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
          </button>
        </div>

        {verifyLogs.length > 0 && (
          <div className="max-h-48 overflow-x-auto overflow-y-auto border border-border-low bg-background/80 p-6 font-mono text-xs space-y-2 no-scrollbar shadow-inner animate-in fade-in zoom-in-95">
            {verifyLogs.map((log, i) => (
              <div
                key={i}
                className={`flex gap-3 ${log.type === "success" ? "text-green-ink" : log.type === "warning" ? "text-primary" : log.type === "system" ? "text-gold" : "text-cream"}`}
              >
                <span>{log.type === "bot" ? ">" : "•"}</span>
                <span className="break-words">{log.msg}</span>
              </div>
            ))}
            {isVerifying && (
              <div className="text-primary animate-pulse italic">
                Connecting to Sello Crawler...
              </div>
            )}
          </div>
        )}
      </section>

      <div className="postal-card flex flex-col items-center justify-between gap-8 border border-green-ink/20 bg-green-ink/5 p-6 sm:p-10 md:flex-row">
        <div className="space-y-1 text-center md:text-left">
          <p className="text-green-ink font-headline text-2xl font-bold italic">
            Checkout Verified?
          </p>
          <p className="text-sm text-muted">
            Continue to your revenue console to monitor agent receipts.
          </p>
        </div>
        <button onClick={onFinish} className="stamp-button px-12 py-4 group">
          Go to my Dashboard
          <svg
            className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Helpers
async function sha256(input: string): Promise<Uint8Array> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hashBuffer);
}

async function checkAccountExists(address: string): Promise<boolean> {
  const rpcUrl =
    process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com";
  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getAccountInfo",
        params: [address, { encoding: "base64" }],
      }),
    });
    const json = (await response.json()) as any;
    return json.result?.value != null;
  } catch {
    return false;
  }
}

async function checkConfigExists(authorityPubkey: string): Promise<boolean> {
  const rpcUrl =
    process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com";
  try {
    const [configPda] = await findConfigPda({
      authority: authorityPubkey as Address,
    });
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getAccountInfo",
        params: [configPda, { encoding: "base64" }],
      }),
    });
    const json = (await response.json()) as any;
    return json.result?.value != null;
  } catch {
    return false;
  }
}

function buildPolicyFiles(data: any) {
  const { author, publisher, license, pda, priceUSDC, serverUrl, voiceId } =
    data;
  const attribution = `According to ${author || "Author"} in ${publisher || "Publisher"}`;

  return {
    llms: `# Sello AI Rights Checkout Policy\n\n[POLICY]\nsello_license: ${license}\nai_summarization: allowed_with_attribution\n\n[ATTRIBUTION]\nformat: ${attribution}\n\n[PAYMENT]\npayment_endpoint: ${serverUrl}/api/narrate\nprice_usdc: ${priceUSDC}\nauthorized_voice_id: ${voiceId}`,
    tdm: JSON.stringify(
      {
        standard: "TDM-1.0",
        attribution: { required: true, format: attribution },
        sello: {
          license,
          proof_of_consent: `solana:devnet:${pda}`,
          price_usdc: priceUSDC,
          voice_id: voiceId,
        },
      },
      null,
      2
    ),
    rsl: `ai-training: no\nai-summarize: allowed-with-attribution\npayment-required: conditional:x402\nsello-compatible: yes\nproof-of-consent: solana:devnet:${pda}\nvoice-cloning: authorized-only`,
  };
}
