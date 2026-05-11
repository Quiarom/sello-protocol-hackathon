"use client";

import { useMemo, useState } from "react";

type LiFiMode = "bridge" | "swap";

type SimulatedLiFiWidgetProps = {
  toAddress: string;
};

export function SimulatedLiFiWidget({ toAddress }: SimulatedLiFiWidgetProps) {
  const [mode, setMode] = useState<LiFiMode>("bridge");

  const snippet = useMemo(
    () => `{
  integrator: "aval-newsrooms",
  toChain: 1151111081099710,
  toToken: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  toAddress: { address: "${toAddress || "[agent-wallet]"}" },
  appearance: "dark"
}`,
    [toAddress]
  );

  return (
    <div className="border border-border-low bg-background/60 p-4">
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          className={`stamp-badge ${
            mode === "bridge" ? "bg-primary text-primary-foreground" : "text-muted"
          }`}
          onClick={() => setMode("bridge")}
        >
          Move USDC
        </button>
        <button
          type="button"
          className={`stamp-badge ${
            mode === "swap" ? "bg-primary text-primary-foreground" : "text-muted"
          }`}
          onClick={() => setMode("swap")}
        >
          Swap SOL
        </button>
      </div>

      <p className="text-sm text-muted">
        {mode === "bridge"
          ? "Preview: move USDC from another wallet into this one."
          : "Preview: turn SOL into USDC for future article payments."}
      </p>

      <pre className="mt-3 overflow-x-auto border border-border-low bg-secondary p-3 text-xs">
        <code>{snippet}</code>
      </pre>
    </div>
  );
}
