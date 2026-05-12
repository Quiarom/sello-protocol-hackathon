"use client";

import { useEffect, useMemo, useState } from "react";
import type { AgentPlatform } from "@/app/components/onboarding/agent/types";
import {
  buildEnvBlock,
  buildSkillMarkdown,
  getInstallInstructions,
  getMcpSnippet,
  getPlatformCliSnippet,
} from "@/app/lib/sello/skill-template";

type StepInstallSkillProps = {
  platform: AgentPlatform;
  agentWalletAddress: string | null;
  maxAutoPayPerTx: number;
  skillInstalled: boolean;
  onSkillInstalledChange: (value: boolean) => void;
  onContinue: () => void;
};

export function StepInstallSkill({
  platform,
  agentWalletAddress,
  maxAutoPayPerTx,
  skillInstalled,
  onSkillInstalledChange,
  onContinue,
}: StepInstallSkillProps) {
  const [serverUrl, setServerUrl] = useState("");

  useEffect(() => {
    setServerUrl(window.location.origin);
  }, []);

  const [payerPubkey, setPayerPubkey] = useState(agentWalletAddress ?? "");
  const [maxAutoPay, setMaxAutoPay] = useState(maxAutoPayPerTx);

  const skillMarkdown = useMemo(
    () =>
      buildSkillMarkdown({
        serverUrl,
        payerPubkey,
        maxAutoPay,
      }),
    [serverUrl, payerPubkey, maxAutoPay]
  );

  const env = useMemo(
    () => ({
      serverUrl,
      payerPubkey,
      maxAutoPay,
    }),
    [serverUrl, payerPubkey, maxAutoPay]
  );

  const installInstructions = getInstallInstructions(platform);
  const cliSnippet = getPlatformCliSnippet(platform, env);
  const mcpSnippet = getMcpSnippet(platform);

  return (
    <div className="space-y-6">
      <section className="postal-card p-5 sm:p-6">
        <p className="font-display text-xl sm:text-2xl uppercase tracking-[0.14em] text-primary">
          1. Automated Compliance Integration
        </p>
        <p className="mt-2 text-xs sm:text-sm text-muted">
          Run this command in your terminal to configure Sello rules.
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-xs sm:text-sm text-foreground">
          {installInstructions.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
        <div className="relative mt-4">
          <pre className="overflow-x-auto border border-border-low bg-background/60 p-4 text-xs sm:text-xs font-mono text-green-ink leading-relaxed">
            <code>{cliSnippet}</code>
          </pre>
          <button
            type="button"
            className="absolute top-2 right-2 stamp-badge bg-card text-xs sm:text-xs text-muted hover:text-primary cursor-pointer"
            onClick={() => navigator.clipboard.writeText(cliSnippet)}
          >
            Copy Command
          </button>
        </div>
      </section>

      <section className="postal-card p-5 sm:p-6">
        <p className="font-display text-xl sm:text-2xl uppercase tracking-[0.14em] text-primary">
          2. Web Browsing (MCP)
        </p>
        <p className="mt-1 text-sm text-muted">
          Your AI needs to read web pages. If you don't have Firecrawl, add this
          server:
        </p>
        <div className="relative mt-3">
          <pre className="overflow-x-auto border border-border-low bg-background/60 p-4 text-xs font-mono leading-relaxed">
            <code>{mcpSnippet}</code>
          </pre>
          <button
            type="button"
            className="absolute top-2 right-2 stamp-badge bg-card text-xs text-muted hover:text-primary cursor-pointer"
            onClick={() => navigator.clipboard.writeText(mcpSnippet)}
          >
            Copy
          </button>
        </div>
      </section>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <section className="postal-card p-5 sm:p-6 order-2 md:order-1">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-display text-lg sm:text-xl uppercase tracking-[0.14em] text-primary">
              SKILL.md Reference
            </p>
            <button
              type="button"
              className="stamp-badge text-xs text-muted hover:text-primary cursor-pointer"
              onClick={() => navigator.clipboard.writeText(skillMarkdown)}
            >
              Copy File
            </button>
          </div>
          <pre className="max-h-40 sm:max-h-48 overflow-auto border border-border-low bg-background/60 p-3 text-xs font-mono opacity-70 leading-tight">
            <code>{skillMarkdown}</code>
          </pre>
        </section>

        <section className="postal-card p-5 sm:p-6 order-1 md:order-2">
          <p className="font-display text-lg sm:text-xl uppercase tracking-[0.14em] text-primary">
            Custom Settings
          </p>
          <div className="mt-4 space-y-4">
            <label className="block font-mono text-xs uppercase tracking-[0.12em] text-muted">
              Auto-Payment Limit ($)
              <input
                type="number"
                step="0.01"
                min="0"
                value={maxAutoPay}
                onChange={(event) => setMaxAutoPay(Number(event.target.value))}
                className="postal-input mt-1 h-8 sm:h-9 text-sm"
              />
            </label>
            <p className="text-sm text-muted italic leading-relaxed">
              The commands update in real-time with your budget.
            </p>
          </div>
        </section>
      </div>

      <div className="flex flex-col items-center gap-6 pt-4">
        <label className="flex cursor-pointer items-center gap-3 rounded-full border border-border-low bg-primary/5 px-6 py-3 transition hover:bg-primary/10">
          <input
            type="checkbox"
            checked={skillInstalled}
            onChange={(event) => onSkillInstalledChange(event.target.checked)}
            className="h-5 w-5 rounded-none border-2 border-primary bg-transparent text-primary focus:ring-0 focus:ring-offset-0"
          />
          <span className="font-display text-base sm:text-lg uppercase tracking-widest text-cream">
            Installation complete
          </span>
        </label>

        <button
          type="button"
          onClick={onContinue}
          disabled={!skillInstalled}
          className="stamp-button w-full sm:w-auto py-3 px-12 group"
        >
          Confirm and Test
          <svg
            className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
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
