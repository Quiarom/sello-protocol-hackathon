"use client";

import type { TestResult } from "@/app/components/onboarding/agent/types";
import { ellipsify } from "@/app/lib/explorer";
import { toast } from "sonner";

interface LicenseResultCardProps {
  result: TestResult;
  onPayTest?: () => void;
  isPayTesting?: boolean;
  payTestSuccess?: boolean;
  receiptUrl?: string;
  narrationAudio?: {
    src: string;
    audioUrl?: string;
    voiceId?: string;
    mimeType: string;
  } | null;
}

function PermissionRow({
  label,
  value,
  priceUSDC,
}: {
  label: string;
  value: boolean | "paid";
  priceUSDC?: number;
}) {
  if (value === "paid") {
    return (
      <div className="flex items-start justify-between gap-3 border-b border-border-low py-2 text-sm">
        <span className="pr-3">{label}</span>
        <span className="font-mono text-xs uppercase tracking-[0.1em] text-gold">
          Paid ${priceUSDC?.toFixed(2) ?? "0.00"} USDC
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-3 border-b border-border-low py-2 text-sm">
      <span className={`pr-3 ${value ? "" : "text-muted line-through"}`}>{label}</span>
      <span className={value ? "text-green-ink" : "text-red-500"}>
        {value ? "Allowed" : "Restricted"}
      </span>
    </div>
  );
}

export function LicenseResultCard({
  result,
  onPayTest,
  isPayTesting,
  payTestSuccess,
  receiptUrl,
  narrationAudio,
}: LicenseResultCardProps) {
  const protectionLevel = Math.max(0, Math.min(100, (result.complianceScore / 4) * 100));

  const explorerPdaUrl = result.contentSelloPDA
    ? `https://explorer.solana.com/address/${result.contentSelloPDA}?cluster=devnet`
    : null;

  return (
    <div className="postal-card p-6 sm:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-700">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-6 border-b border-border-low pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <span className="h-2.5 w-2.5 rounded-full bg-green-ink animate-pulse shadow-[0_0_8px_#00e38b]" />
             <p className="font-display text-3xl uppercase tracking-widest text-cream">
              Compliance Certificate
             </p>
          </div>
          <p className="text-xs text-muted max-w-sm italic">Machine-readable rights verified via Sello Protocol on-chain notary.</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end sm:text-right">
          <span className="stamp-badge text-primary text-xs py-1.5 px-4 font-black tracking-tighter">
            {result.license?.toUpperCase() ?? "UNKNOWN"}
          </span>
          {result.onchainVerified && (
            <div className="flex items-center gap-2 bg-green-ink/10 text-green-ink border border-green-ink/30 px-3 py-1 text-[10px] uppercase font-mono font-bold tracking-widest">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.9L9.03 9.069a2.25 20 0 002.24 0l6.864-4.171A2.25 2.25 0 0015.81 2H4.19a2.25 2.25 0 00-2.024 2.9zM18 8.162l-6.685 4.061a3.75 3.75 0 01-2.63 0L2 8.162V15.75A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.75V8.162z" clipRule="evenodd" /></svg>
              On-Chain Verified
            </div>
          )}
        </div>
      </div>

      {/* Content Meta & Permissions */}
      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-gold font-bold">Content Authority</p>
            <p className="font-headline text-2xl font-bold text-cream underline decoration-primary decoration-1 underline-offset-4">
              {result.author}
            </p>
            <p className="text-xs text-muted font-mono">{result.publisher}</p>
          </div>

          <div className="space-y-3">
             <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Legal Attribution</p>
             <div className="bg-background/80 border border-border-low p-4 relative group">
                <code className="block break-words text-xs leading-relaxed text-muted-foreground">{result.attribution}</code>
                <button 
                  onClick={() => { navigator.clipboard.writeText(result.attribution); toast.success("Copied to clipboard"); }}
                  className="absolute top-2 right-2 text-[8px] uppercase font-mono text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Copy
                </button>
             </div>
          </div>

          {explorerPdaUrl && (
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Public Record (PDA)</p>
              <a href={explorerPdaUrl} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-2 break-all text-xs font-mono text-primary hover:underline group">
                {ellipsify(result.contentSelloPDA!, 12)}
                <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted font-bold sm:text-right">Machine Permissions</p>
          <div className="divide-y divide-border-low border-t border-border-low">
             <PermissionRow label="Inference / Summarize" value={result.permissions.canSummarize} />
             <PermissionRow label="Contextual Quotes" value={result.permissions.canQuote} />
             <PermissionRow label="Voice Narration" value={result.permissions.canVoice} priceUSDC={result.priceUSDC} />
             <PermissionRow label="Model Training" value={result.permissions.canTrain} />
          </div>
          
          <div className="pt-2">
            <div className="flex justify-between items-end font-mono text-[10px] uppercase tracking-widest mb-2">
               <span className="text-muted">Readiness Score</span>
               <span className="text-primary font-bold">{result.complianceScore}/4</span>
            </div>
            <div className="h-1.5 w-full bg-border-low rounded-full overflow-hidden">
               <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${protectionLevel}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Output Section (Only visible after payment or if unlocked) */}
      {(isPayTesting || payTestSuccess || receiptUrl || narrationAudio) && (
        <section className="pt-8 border-t border-primary/20 space-y-6 animate-in slide-in-from-bottom-4 duration-700">
           <div className="bg-[#0c1511] border border-green-ink/30 p-6 sm:p-10 rounded-none relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-5">
                 <div className="postmark h-24 w-24 flex items-center justify-center text-[10px]">UNLOCKED</div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                 <div className="flex-1 space-y-6 w-full text-center md:text-left">
	                    <div className="space-y-2">
	                      <p className="font-display text-2xl uppercase tracking-widest text-green-ink">
                          {narrationAudio ? "Verified Asset" : "Generating Voice Asset"}
                        </p>
	                      <p className="text-xs text-muted italic">
                          {narrationAudio
                            ? "Narration generated via ElevenLabs and ready to play."
                            : "Payment confirmed. Waiting for ElevenLabs to return the MP3 narration."}
                        </p>
	                    </div>
	                    
	                    {narrationAudio?.src ? (
	                       <div className="space-y-3">
	                          <audio controls className="w-full h-10 accent-primary" src={narrationAudio.src} />
	                          <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-muted px-1">
	                             <span>Codec: MPEG-3</span>
	                             <span>{narrationAudio.voiceId ?? "default voice"}</span>
	                          </div>
	                       </div>
	                    ) : (
                        <div className="border border-border-low bg-background/40 p-4">
                          <div className="flex items-center gap-3 text-primary">
                            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <span className="font-mono text-[10px] uppercase tracking-widest">
                              ElevenLabs synthesis in progress
                            </span>
                          </div>
                        </div>
                      )}
	                 </div>

                 <div className="shrink-0 flex flex-col items-center gap-4">
                    <div className="stamp-badge border-green-ink/40 bg-green-ink/5 text-green-ink text-xs py-3 px-6 font-black uppercase tracking-widest">
                       Settled: ${result.priceUSDC.toFixed(2)} USDC
                    </div>
                    {receiptUrl && (
                      <a href={receiptUrl} target="_blank" rel="noreferrer" className="text-[10px] font-mono uppercase text-muted hover:text-primary transition-colors underline underline-offset-4">
                        View On-Chain Receipt
                      </a>
                    )}
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* Action CTA for Demo */}
      {!payTestSuccess && onPayTest && (
        <div className="pt-4 text-center">
           <button 
            onClick={onPayTest}
            disabled={isPayTesting}
            className="stamp-button w-full px-6 py-4 text-lg group sm:min-w-[300px] sm:w-auto sm:px-12 sm:text-xl"
           >
             {isPayTesting ? "Processing..." : `Unlock Voice Narration ($${result.priceUSDC.toFixed(2)})`}
             {!isPayTesting && (
               <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             )}
           </button>
           <p className="mt-4 text-[10px] uppercase font-mono tracking-widest text-muted italic">This action will sign a real x402 transaction on Solana Devnet.</p>
        </div>
      )}
    </div>
  );
}
