"use client";

import { useState } from "react";
import type { TestResult } from "@/app/components/onboarding/agent/types";
import { LicenseResultCard } from "@/app/components/sello/LicenseResultCard";
import { toast } from "sonner";
import { useWallet } from "@/app/lib/wallet/context";
import { useSendTransaction } from "@/app/lib/hooks/use-send-transaction";
import { type Address } from "@solana/kit";
import { ellipsify } from "@/app/lib/explorer";
import {
  findConfigPda,
  getRecordUsageInstructionAsync,
} from "@/app/generated/sello";
import {
  findAssociatedTokenPda,
  getTransferCheckedInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { getTransferSolInstruction } from "@solana-program/system";

type StepTestURLProps = {
  testURL: string;
  testResult: TestResult | null;
  testLoading: boolean;
  testError: string | null;
  onUrlChange: (value: string) => void;
  onAnalyze: () => Promise<TestResult | null>;
  onContinue: () => void;
};

type DemoLog = {
  type: "bot" | "system" | "success" | "warning";
  message: string;
  timestamp: string;
};

type NarrationAudio = {
  src: string;
  audioUrl?: string;
  voiceId?: string;
  mimeType: string;
};

type TestResultWithDebug = TestResult & {
  debugRawHead?: string;
};

export function StepTestURL({
  testURL,
  testResult,
  testLoading,
  testError,
  onUrlChange,
  onAnalyze,
  onContinue,
}: StepTestURLProps) {
  const { signer } = useWallet();
  const { send } = useSendTransaction();

  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paySuccess, setPaySuccess] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>();
  const [narrationAudio, setNarrationAudio] = useState<NarrationAudio | null>(
    null
  );

  const [demoLogs, setDemoLogs] = useState<DemoLog[]>([]);
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  const addLog = (message: string, type: DemoLog["type"] = "bot") => {
    setDemoLogs((prev) => [
      ...prev,
      { message, type, timestamp: new Date().toLocaleTimeString() },
    ]);
  };

  const runFullDemo = async () => {
    if (!testURL) return;
    setIsDemoRunning(true);
    setDemoLogs([]);
    setPaySuccess(false);
    setReceiptUrl(undefined);
    setNarrationAudio(null);

    addLog("Initializing agent checkout", "system");
    await new Promise((r) => setTimeout(r, 600));

    addLog(`Fetching article: ${testURL}`);
    const result = await onAnalyze();
    if (result) {
      await continueDemoAfterAnalysis(result);
    } else {
      addLog("Analysis failed before payment negotiation.", "warning");
      setIsDemoRunning(false);
    }
  };

  const continueDemoAfterAnalysis = async (result: TestResult) => {
    if (result.hasSello) {
      addLog("Sello tag detected", "success");
      await new Promise((r) => setTimeout(r, 800));

      addLog("Reading llms.txt and tdm-policy.json", "system");
      await new Promise((r) => setTimeout(r, 600));

      addLog(`License found: ${result.license}`, "bot");
      addLog("Summary allowed with attribution", "success");

      if (result.payEndpoint) {
        addLog("Voice narration requires payment", "warning");
        addLog("402 Payment Required", "warning");
        await handleRealPayment(result);
      } else {
        addLog("Free license detected. Accessing content...", "success");
        setIsDemoRunning(false);
      }
    } else {
      addLog("Analysis finished: No Sello Tag found.", "warning");

      const raw = (result as TestResultWithDebug).debugRawHead ?? "";
      if (
        raw.includes("error") ||
        raw.includes("cloud-blue") ||
        raw.includes("404")
      ) {
        addLog("DETECTED: Scraping failure (SiteGround Blocking).", "warning");
        addLog(
          "HINT: Try using HTTPS or disable 'AI Bot Protection' in SiteGround.",
          "system"
        );
      }

      setIsDemoRunning(false);
    }
  };

  const handleRealPayment = async (result = testResult) => {
    if (!result?.payEndpoint || !signer) {
      if (!signer) addLog("ERROR: Wallet not connected.", "warning");
      setIsDemoRunning(false);
      return;
    }

    setPayLoading(true);
    setPayError(null);

    try {
      addLog("Signing x402-style payment", "system");

      const selloAddress = (result.contentSelloPDA ??
        result.selloId) as Address;
      const amountPaid = BigInt(
        Math.round((result.priceUSDC || 0.1) * 1_000_000)
      );
      const nonce = BigInt(Math.floor(Math.random() * 1000000));

      const usdcMint =
        "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU" as Address;
      // REAL DESTINATION: The creator wallet from on-chain data
      const creatorWallet =
        ((result as any).authorWallet as Address) ||
        "Y5GHe2xYz9ThBZsGN7VVJuSyjXNrkoGg1E2AJrNQYwN";
      const treasuryAddress = creatorWallet as Address;

      addLog("USDC payment sent", "bot");

      const [sourceAta] = await findAssociatedTokenPda({
        owner: signer.address,
        mint: usdcMint,
        tokenProgram: TOKEN_PROGRAM_ADDRESS,
      });

      const [destinationAta] = await findAssociatedTokenPda({
        owner: treasuryAddress,
        mint: usdcMint,
        tokenProgram: TOKEN_PROGRAM_ADDRESS,
      });

      // addLog(`Source ATA: ${ellipsify(sourceAta, 4)}`, "system");
      // addLog(`Dest ATA: ${ellipsify(destinationAta, 4)}`, "system");

      // 1. REAL USDC TRANSFER
      const transferUsdcIx = getTransferCheckedInstruction({
        source: sourceAta,
        mint: usdcMint,
        destination: destinationAta,
        authority: signer,
        amount: amountPaid,
        decimals: 6,
      });

      // 2. SMALL SOL TRANSFER (to ensure visibility in history)
      const transferSolIx = getTransferSolInstruction({
        source: signer,
        destination: treasuryAddress,
        amount: 1_000_000n, // 0.001 SOL
      });

      // 3. Sello Record Usage Instruction
      const [configPda] = await findConfigPda({
        authority: treasuryAddress,
      });

      const recordIx = await getRecordUsageInstructionAsync({
        config: configPda,
        sello: selloAddress,
        payer: signer,
        usageType: 2, // VOICE
        amountPaid: amountPaid,
        nonce: nonce,
      });

      // REAL TRANSACTION SIGNING - Sending all three instructions
      const signature = await send({
        instructions: [transferUsdcIx, transferSolIx, recordIx],
      });

      addLog("UsageReceipt recorded on Solana", "success");
      addLog("Narration unlocked", "success");

      const response = await fetch(result.payEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-payment-payload": signature,
        },
        body: JSON.stringify({
          article_url: testURL,
          sello_pda: result.contentSelloPDA ?? result.selloId,
        }),
      });

      const body = (await response.json().catch(() => ({}))) as {
        audioUrl?: string | null;
        audioBase64?: string;
        mimeType?: string;
        voiceId?: string;
        error?: string;
      };

      if (!response.ok) throw new Error(body.error || "Verification failed");
      const mimeType = body.mimeType ?? "audio/mpeg";
      const audioSrc =
        body.audioUrl ??
        (body.audioBase64
          ? `data:${mimeType};base64,${body.audioBase64}`
          : null);
      if (!audioSrc) throw new Error("Narration generated no playable audio.");

      setPaySuccess(true);
      setReceiptUrl(body.audioUrl ?? undefined);
      setNarrationAudio({
        src: audioSrc,
        audioUrl: body.audioUrl ?? undefined,
        voiceId: body.voiceId,
        mimeType,
      });
      addLog(
        body.audioUrl
          ? "ElevenLabs narration cached and ready to play."
          : "ElevenLabs narration returned inline and ready to play.",
        "success"
      );
      toast.success("Micropayment Verified!");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Payment failed.";
      addLog(`ABORTED: ${msg}`, "warning");
      if (msg.includes("Appwrite")) {
        addLog(
          "HINT: set APPWRITE_API_KEY and optional APPWRITE_* vars in Frontend/sello-colosseum-clean/.env.local",
          "system"
        );
      }
      setPayError(msg);
    } finally {
      setPayLoading(false);
      setIsDemoRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="postal-card p-6 sm:p-8 space-y-4 shadow-xl border-primary/20">
        <label className="font-display text-xl sm:text-2xl uppercase tracking-[0.14em] text-primary">
          Live Rights Checkout
        </label>
        <p className="text-xs sm:text-sm text-muted leading-relaxed">
          Paste the URL of an article with a Sello Tag to watch the agent
          detect, negotiate, and unlock content.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={testURL}
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder="https://news.asilodigital.com/test1/"
            className="postal-input flex-1 text-sm"
          />
          <button
            type="button"
            onClick={() =>
              onUrlChange(`${window.location.origin}/blog/protected-article`)
            }
            className="text-xs font-mono text-primary uppercase hover:underline decoration-primary decoration-1 underline-offset-4 font-bold cursor-pointer"
          >
            Add Demo URL
          </button>
        </div>
        <button
          type="button"
          onClick={() => void runFullDemo()}
          disabled={!testURL || testLoading || isDemoRunning}
          className="stamp-button w-full md:w-auto py-4 px-12 text-lg sm:text-xl group"
        >
          {isDemoRunning ? "Agent Working..." : "Run Agent Checkout"}
          {!isDemoRunning && (
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
      </section>

      {/* Terminal Visualizer - CLEAN UI */}
      {(demoLogs.length > 0 || testLoading) && (
        <section className="postal-card bg-[#0a0504] overflow-hidden border-primary/40 animate-in fade-in zoom-in-95 duration-500 shadow-2xl rounded-none relative">
          <div className="bg-primary/5 px-4 py-3 border-b border-border-low flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-xs uppercase text-primary font-bold tracking-[0.2em]">
                Agent Terminal
              </span>
            </div>
            <div className="flex gap-1.5 opacity-20">
              <div className="h-1 w-1 rounded-full bg-cream" />
              <div className="h-1 w-1 rounded-full bg-cream" />
              <div className="h-1 w-1 rounded-full bg-cream" />
            </div>
          </div>
          <div className="h-64 overflow-x-auto overflow-y-auto bg-transparent p-4 font-mono text-xs space-y-3 no-scrollbar selection:bg-primary/30 sm:h-80 sm:p-8">
            {demoLogs.map((log, i) => (
              <div
                key={i}
                className="flex gap-3 animate-in slide-in-from-left-2 duration-300"
              >
                <span className="text-muted/20 shrink-0 hidden sm:inline font-bold">
                  [{log.timestamp}]
                </span>
                <span
                  className={`min-w-0 break-words leading-relaxed
                  ${log.type === "system" ? "text-gold/90" : ""}
                  ${log.type === "success" ? "text-green-ink" : ""}
                  ${log.type === "warning" ? "text-primary/90" : ""}
                  ${log.type === "bot" ? "text-cream/90" : ""}
                `}
                >
                  {log.type === "bot" ? "> " : ""}
                  {log.message}
                </span>
              </div>
            ))}
            {isDemoRunning && !paySuccess && (
              <div className="flex gap-2 items-center text-primary animate-pulse pt-2">
                <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-primary" />
                <span className="text-xs uppercase tracking-widest font-black">
                  Negotiating...
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {testResult &&
        (!isDemoRunning || payLoading || paySuccess || narrationAudio) && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {testResult.hasSello ? (
              <LicenseResultCard
                result={testResult}
                onPayTest={
                  testResult.payEndpoint ? handleRealPayment : undefined
                }
                isPayTesting={payLoading}
                payTestSuccess={paySuccess}
                receiptUrl={receiptUrl}
                narrationAudio={narrationAudio}
              />
            ) : (
              <div className="postal-card border-yellow-500/30 bg-yellow-500/10 p-10 text-center space-y-4">
                <div className="postmark h-14 w-14 mx-auto opacity-30 flex items-center justify-center text-xs border-yellow-600 text-yellow-600 font-bold uppercase tracking-widest">
                  Blocked
                </div>
                <div className="space-y-1">
                  <p className="font-headline text-3xl font-bold italic text-yellow-600 uppercase">
                    Detection Failure
                  </p>
                  <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
                    The bot reached an error page or a security gateway. Ensure
                    the URL is public and uses <strong>HTTPS</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      {payError ? (
        <div className="postal-card break-words border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {payError}
        </div>
      ) : null}

      <div className="flex justify-center sm:justify-end pt-6">
        <button
          type="button"
          onClick={onContinue}
          className="stamp-button w-full sm:w-auto py-4 px-16 text-lg group"
        >
          {paySuccess ? "Finish Onboarding" : "Continue"}
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
