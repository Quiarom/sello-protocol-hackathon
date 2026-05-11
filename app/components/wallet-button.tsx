"use client";

import { useState, useRef, useEffect } from "react";
import { useWallet } from "../lib/wallet/context";
import { useBalance } from "../lib/hooks/use-balance";
import { lamportsToSolString } from "../lib/lamports";
import { ellipsify } from "../lib/explorer";
import { useCluster } from "./cluster-context";

export function WalletButton() {
  const { connectors, connect, disconnect, wallet, status, error } =
    useWallet();

  const { getExplorerUrl } = useCluster();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const address = wallet?.account.address;
  const balance = useBalance(address);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status !== "connected") {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => (isOpen ? close() : open())}
          className="stamp-button h-9 min-w-[118px] cursor-pointer px-3 py-2 text-[10px] sm:min-w-[140px] sm:px-4 sm:text-xs md:text-sm"
        >
          {status === "connecting" ? "Connecting..." : "Connect Wallet"}
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full z-50 mt-3 w-[min(16rem,calc(100vw-2rem))] border border-border-low bg-card p-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 sm:w-64">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted">
              Select Firm Authority
            </p>
            <div className="space-y-2">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={async () => {
                    try {
                      await connect(connector.id);
                      close();
                    } catch {
                      // connection errors are surfaced through context state
                    }
                  }}
                  disabled={status === "connecting"}
                  className="flex w-full cursor-pointer items-center gap-3 border border-border-low bg-background/50 px-3 py-2 text-left transition-all hover:border-primary hover:bg-primary/5 disabled:opacity-50"
                >
                  {connector.icon && (
                    <img
                      src={connector.icon}
                      alt=""
                      className="h-5 w-5 rounded-sm grayscale group-hover:grayscale-0"
                    />
                  )}
                  <span className="font-display text-sm uppercase tracking-wider">{connector.name}</span>
                </button>
              ))}
            </div>
            {error != null && (
              <p className="mt-3 font-mono text-[9px] text-primary">
                {error instanceof Error ? error.message : String(error)}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => (isOpen ? close() : open())}
        className="flex h-9 max-w-[11rem] cursor-pointer items-center gap-2 border border-primary/40 bg-primary/5 px-3 py-2 transition-all hover:border-primary active:scale-95 sm:max-w-none sm:gap-3 sm:px-4"
      >
        <span className="h-2 w-2 rounded-full bg-green-ink animate-pulse shadow-[0_0_8px_#00e38b]" />
        <span className="truncate font-mono text-[10px] font-bold tracking-wider text-cream sm:text-xs">{ellipsify(address!, 4)}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-3 w-[min(18rem,calc(100vw-2rem))] border border-border-low bg-card p-5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 sm:w-72 sm:p-6">
          <div className="mb-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Available Liquidity</p>
            <p className="font-headline text-2xl font-bold text-cream mt-1">
              {balance.lamports != null
                ? lamportsToSolString(balance.lamports)
                : "\u2014"}{" "}
              <span className="font-display text-sm font-normal text-muted tracking-widest">SOL</span>
            </p>
          </div>

          <div className="mb-4 bg-background/80 border border-border-low p-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">Public Address</p>
            <p className="break-all font-mono text-[10px] text-cream/80 leading-relaxed">{address}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 stamp-badge bg-background transition-colors hover:text-primary cursor-pointer text-[10px] py-1"
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <a
              href={getExplorerUrl(`/address/${address}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 stamp-badge bg-background text-center transition-colors hover:text-primary cursor-pointer text-[10px] py-1"
            >
              Explorer
            </a>
          </div>

          <button
            onClick={() => {
              disconnect();
              close();
            }}
            className="mt-4 w-full border border-primary/20 bg-primary/5 py-2 font-display text-xs uppercase tracking-[0.2em] text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            Revoke Access
          </button>
        </div>
      )}
    </div>
  );
}
