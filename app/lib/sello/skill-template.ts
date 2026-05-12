import type { AgentPlatform } from "@/app/components/onboarding/agent/types";

type SkillEnv = {
  serverUrl: string;
  payerPubkey: string;
  maxAutoPay: number;
};

const BASE_SKILL_BODY = `---
name: sello-rights-checkout
description: Sello is the Rights Checkout for AI Agents. Before summarizing, citing, or narrating content, detect Sello rules. Publisher creates the checkout; your job is to use it and leave a Proof of Consent receipt.
triggers: [fetch url, summarize, narrate, cite, quote]
---

1. Search <meta name="sello"> in HTML metadata.
2. Parse checkout fields: id, license, author, publisher, pay, price_usdc.
3. Rights Logic:
   - sello-free: proceed with mandatory attribution.
   - sello-voice: REQUIRES x402-style payment before voice generation.
   - sello-pay: REQUIRES x402-style payment before any restricted use.
4. Mandatory attribution: "According to [author] in [publisher]".
5. 402 Payment Required: execute settlement and record UsageReceipt on Solana devnet.
6. Proof of Consent: Always leave a machine-readable record of permitted use.
`;

export function buildSkillMarkdown(env: SkillEnv): string {
  const autoPay = env.maxAutoPay.toFixed(2);
  return `${BASE_SKILL_BODY}
Environment variables:

SELLO_SERVER_URL=${env.serverUrl}
SELLO_PAYER_PUBKEY=${env.payerPubkey || "[agent-wallet-pubkey]"}
SELLO_MAX_AUTO_PAY=${autoPay}
`;
}

export function buildEnvBlock(env: SkillEnv): string {
  return `SELLO_SERVER_URL=${env.serverUrl}
SELLO_PAYER_PUBKEY=${env.payerPubkey}
SELLO_MAX_AUTO_PAY=${env.maxAutoPay.toFixed(2)}`;
}

export function getInstallInstructions(platform: AgentPlatform): string[] {
  if (platform === "claude-code") {
    return [
      "Open your terminal in your project root.",
      "Copy and paste the command below to install the Skill automatically.",
      "Restart Claude Code to activate the new rules.",
    ];
  }
  if (platform === "gemini-cli") {
    return [
      "Open your terminal.",
      "Run the command to download the Sello configuration.",
      "Gemini will now consult licenses before summarizing URLs.",
    ];
  }

  if (platform === "codex") {
    return [
      "Open .github/copilot-instructions.md in your editor.",
      "If it doesn't exist, create it in your project root.",
      "Paste the content of the 'Sello setup file' at the end of the file.",
    ];
  }

  return [
    "Copy the content of the configuration file.",
    "Paste it into the 'System Prompt' or instructions of your custom agent.",
    "Ensure the agent has access to web browsing.",
  ];
}

export function getPlatformCliSnippet(
  platform: AgentPlatform,
  env: SkillEnv
): string {
  const envVars = `SELLO_SERVER_URL=${env.serverUrl} SELLO_PAYER_PUBKEY=${env.payerPubkey} SELLO_MAX_AUTO_PAY=${env.maxAutoPay.toFixed(2)}`;

  if (platform === "claude-code") {
    return `mkdir -p .claude/skills/sello-content-license && \\
${envVars} \\
curl -s https://raw.githubusercontent.com/Quiarom/sello-protocol-hackathon/main/.claude/skills/sello-content-license/SKILL.md | \\
sed "s|\\\${SELLO_SERVER_URL}|${env.serverUrl}|g; s|\\\${SELLO_PAYER_PUBKEY}|${env.payerPubkey}|g; s|\\\${SELLO_MAX_AUTO_PAY}|${env.maxAutoPay.toFixed(2)}|g" > .claude/skills/sello-content-license/SKILL.md`;
  }

  if (platform === "gemini-cli") {
    return `mkdir -p .gemini/skills && \\
curl -s -o .gemini/skills/sello-content-license.md https://raw.githubusercontent.com/Quiarom/sello-protocol-hackathon/main/.claude/skills/sello-content-license/SKILL.md && \\
echo "\\nEnvironment variables:\\n${envVars.replace(/ /g, "\\n")}" >> .gemini/skills/sello-content-license.md`;
  }

  if (platform === "codex") {
    return `mkdir -p .github && touch .github/copilot-instructions.md && \\
echo "\\n\\n${BASE_SKILL_BODY.replace(/\n/g, "\\n")}\\nEnvironment variables:\\n${envVars.replace(/ /g, "\\n")}" >> .github/copilot-instructions.md`;
  }

  return `System Prompt Instructions:
----------------------------------------
${BASE_SKILL_BODY}

Required Environment Variables:
${envVars.replace(/ /g, "\n")}
----------------------------------------`;
}

export function getMcpSnippet(platform: AgentPlatform): string {
  if (platform === "claude-code") {
    return `claude mcp add --transport http firecrawl-mcp https://mcp.firecrawl.dev/mcp`;
  }

  return `{
  "mcpServers": {
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "@mendable/firecrawl-mcp"]
    }
  }
}`;
}
