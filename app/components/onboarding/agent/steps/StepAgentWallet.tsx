"use client";

import { useState } from "react";
import { SimulatedLiFiWidget } from "@/app/components/lifi/SimulatedLiFiWidget";
import type { PaymentConfig } from "@/app/components/onboarding/agent/types";
import { useWallet } from "@/app/lib/wallet/context";
import { useBalance } from "@/app/lib/hooks/use-balance";
import { ellipsify } from "@/app/lib/explorer";
import { toast } from "sonner";

type StepAgentWalletProps = {
  agentWalletAddress: string | null;
  paymentConfig: PaymentConfig;
  onWalletChange: (value: string) => void;
  onPaymentConfigChange: (value: PaymentConfig) => void;
  onContinue: () => void;
};

type FundingTab = "bridge" | "swap" | "later";

export function StepAgentWallet({
  agentWalletAddress,
  paymentConfig,
  onWalletChange,
  onPaymentConfigChange,
  onContinue,
}: StepAgentWalletProps) {
  const { connectors, connect, disconnect, wallet, status, error } = useWallet();
  const connectedAddress = wallet?.account.address ?? null;
  const [walletMode, setWalletMode] = useState<"phantom" | "manual">("phantom");
  const balance = useBalance(
    walletMode === "phantom" ? (connectedAddress ?? undefined) : undefined
  );

  const activeWallet =
    walletMode === "phantom"
      ? (connectedAddress ?? agentWalletAddress ?? "")
      : (agentWalletAddress ?? "");

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Agent Identity Section */}
      <section className="postal-card p-6 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-low pb-6">
          <div className="space-y-1">
            <h3 className="font-display text-2xl uppercase tracking-widest text-primary">Agent Identity</h3>
            <p className="text-xs text-muted">Initialize your agent's unique signing authority.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setWalletMode("phantom")}
              className={`stamp-badge text-[10px] px-3 py-1 transition-all ${walletMode === "phantom" ? "bg-primary/20 text-primary border-primary" : "text-muted hover:text-cream opacity-50"}`}
            >
              Browser Wallet
            </button>
            <button 
              onClick={() => setWalletMode("manual")}
              className={`stamp-badge text-[10px] px-3 py-1 transition-all ${walletMode === "manual" ? "bg-primary/20 text-primary border-primary" : "text-muted hover:text-cream opacity-50"}`}
            >
              Manual / CLI
            </button>
          </div>
        </div>

        {walletMode === "phantom" ? (
          <div className="bg-background/40 border border-border-low p-6 sm:p-8 rounded-none text-center space-y-6">
            {status === "connected" && connectedAddress ? (
              <div className="space-y-4 animate-in zoom-in-95 duration-500">
                <div className="inline-flex items-center gap-3 bg-green-ink/5 border border-green-ink/20 px-4 py-2 rounded-full">
                  <span className="h-2 w-2 rounded-full bg-green-ink animate-pulse" />
                  <span className="font-mono text-xs text-green-ink">{ellipsify(connectedAddress, 8)}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                   <button
                    type="button"
                    onClick={() => { onWalletChange(connectedAddress); toast.success("Identity Confirmed"); }}
                    className={`stamp-button px-8 py-2 text-sm ${agentWalletAddress === connectedAddress ? "opacity-50 grayscale" : ""}`}
                  >
                    {agentWalletAddress === connectedAddress ? "Identity Set" : "Confirm Identity"}
                  </button>
                  <button onClick={() => disconnect()} className="text-[10px] uppercase font-mono tracking-widest text-muted hover:text-red-400">
                    Change Wallet
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-primary/5 rounded-full w-fit mx-auto">
                   <svg className="h-8 w-8 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 21a9.003 9.003 0 008.384-5.562M9 14l5 5m0-5l-5 5" />
                  </svg>
                </div>
                <p className="text-xs text-muted italic max-w-xs mx-auto">Connect your wallet to act as the legal representative for your AI agent.</p>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  {connectors.map(c => (
                    <button key={c.id} onClick={() => connect(c.id)} className="stamp-button-secondary w-full px-6 py-3 text-[10px] sm:w-auto">
                      Connect {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
             <label className="block space-y-3">
              <span className="font-mono text-[10px] uppercase text-muted tracking-widest block">Public Key Authority</span>
              <input
                type="text"
                value={agentWalletAddress ?? ""}
                placeholder="Ex: So11111111111111111111111111111111111111112"
                onChange={(event) => onWalletChange(event.target.value)}
                className="postal-input text-xs sm:text-sm font-mono border-muted/30 focus:border-primary"
              />
            </label>
            <details className="group border border-border-low bg-card/20 p-3">
              <summary className="text-[9px] uppercase font-mono text-muted cursor-pointer hover:text-cream transition-colors">How to generate a headless identity?</summary>
              <pre className="mt-3 p-4 bg-background/80 text-[9px] text-primary overflow-x-auto leading-relaxed border-l-2 border-primary">
                <code>{`solana-keygen new --outfile agent.json
solana-keygen pubkey agent.json`}</code>
              </pre>
            </details>
          </div>
        )}
      </section>

      {/* Budget & Limits Section */}
      <section className="postal-card p-6 sm:p-10 space-y-8">
        <div className="space-y-1">
          <h3 className="font-display text-2xl uppercase tracking-widest text-primary">Autonomous Budget</h3>
          <p className="text-xs text-muted">Set boundaries for automated license negotiations.</p>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-8">
            <label className="flex cursor-pointer items-start gap-4 group">
              <input
                type="checkbox"
                checked={paymentConfig.autoPayEnabled}
                onChange={(e) => onPaymentConfigChange({ ...paymentConfig, autoPayEnabled: e.target.checked })}
                className="mt-1 h-5 w-5 rounded-none border-2 border-primary bg-transparent text-primary focus:ring-0 shrink-0"
              />
              <div className="space-y-1">
                <span className="font-headline text-xl font-bold text-cream group-hover:text-primary transition-colors">Enabled Auto-Pay</span>
                <p className="text-[10px] text-muted leading-relaxed">Agent will sign licenses instantly if under the limit.</p>
              </div>
            </label>

            <div className="bg-primary/5 border-l-2 border-primary p-4 space-y-2">
               <p className="font-mono text-[9px] uppercase text-primary font-bold">Standard x402 Protocol</p>
               <p className="text-[10px] text-muted italic">"Payments are executed directly via on-chain instructions, ensuring zero counterparty risk."</p>
            </div>
          </div>

          <div className="space-y-6 pt-2">
             <div className="space-y-4">
              <div className="flex justify-between items-end font-mono text-[10px] uppercase tracking-widest">
                <span className="text-muted">Max per Transaction</span>
                <span className="text-gold font-bold text-lg">${paymentConfig.maxAutoPayPerTx.toFixed(2)}</span>
              </div>
              <input
                type="range" min="0.01" max="1" step="0.01"
                value={paymentConfig.maxAutoPayPerTx}
                onChange={(e) => onPaymentConfigChange({ ...paymentConfig, maxAutoPayPerTx: Number(e.target.value) })}
                className="h-1.5 w-full cursor-pointer appearance-none bg-border-low accent-gold"
              />
            </div>
            
            <div className="space-y-4 pt-4 border-t border-border-low">
              <div className="flex justify-between items-end font-mono text-[10px] uppercase tracking-widest">
                <span className="text-muted">Daily Allowance</span>
                <span className="text-gold font-bold text-lg">${paymentConfig.maxAutoPayPerDay.toFixed(2)}</span>
              </div>
              <input
                type="range" min="0.1" max="50" step="0.1"
                value={paymentConfig.maxAutoPayPerDay}
                onChange={(e) => onPaymentConfigChange({ ...paymentConfig, maxAutoPayPerDay: Number(e.target.value) })}
                className="h-1.5 w-full cursor-pointer appearance-none bg-border-low accent-gold"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Liquidity Management */}
      <section className="postal-card p-6 sm:p-10 border-dashed border-primary/30 bg-primary/[0.01] space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display text-2xl uppercase tracking-widest text-cream">Liquidity Hub</h3>
            <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Bridge Assets for Automated Settlement</p>
          </div>
          <span className="stamp-badge text-[9px] bg-green-ink/10 text-green-ink border-green-ink/30 uppercase">USDC Active</span>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
           <div className="postal-card bg-background/60 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-gold animate-pulse" />
                <p className="font-mono text-[10px] uppercase tracking-widest text-gold font-bold">Manual Funding</p>
              </div>
              <p className="text-[11px] text-muted leading-relaxed italic">The agent requires a small balance to start the simulation.</p>
              <div className="flex items-center gap-2 border border-border-low bg-background p-2">
                <span className="min-w-0 flex-1 break-all font-mono text-[9px] text-cream">{activeWallet || "Awaiting Connection..."}</span>
                <button 
                  onClick={() => { navigator.clipboard.writeText(activeWallet); toast.success("Copied to clipboard"); }}
                  className="text-[9px] text-primary uppercase font-bold hover:underline"
                >
                  Copy
                </button>
              </div>
              <a 
                href="https://faucet.circle.com/" target="_blank" rel="noopener noreferrer"
                className="stamp-badge w-full justify-center bg-gold/10 text-gold border-gold/30 hover:bg-gold/20 text-[9px] py-2"
              >
                Get Test USDC (Circle Faucet) ↗
              </a>
           </div>

           <div className="p-4 space-y-4">
              <p className="text-xs text-muted leading-relaxed">
                "By allocating liquidity, you enable your AI to settle transactions autonomously, removing the manual friction from the knowledge economy."
              </p>
              <div className="flex items-center gap-2 text-primary">
                 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
                 <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-black">Fast-Track Settlement</span>
              </div>
           </div>
        </div>
      </section>

      <div className="flex justify-center pt-6">
        <button
          type="button"
          onClick={onContinue}
          disabled={!activeWallet}
          className="stamp-button w-full sm:w-auto py-5 px-20 text-2xl group shadow-2xl"
        >
          Confirm Identity
          <svg className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
