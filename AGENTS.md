# AGENTS.md

## Goal

Sello Protocol is the **rights checkout for AI agents** using newsroom content.
**Publisher creates the checkout. Agent uses the checkout. Solana keeps the receipt.**

The Colosseum MVP demonstrates the complete loop: rights detection, **x402-style payment**, Solana **Proof of Consent** (UsageReceipt), and revenue monitoring via **Aval Newsrooms**.

## Current MVP Scope

- Next.js demo app.
- Aval Newsrooms dashboard.
- Article registration screen.
- Sello meta tag.
- `llms.txt`, `tdm-policy.json`, `rsl.txt`.
- Anchor program named `sello`.
- ContentSello and UsageReceipt records.
- VoiceConsent exists as a small optional account.

## Out of Scope

- Production LI.FI bridge.
- Production x402 middleware.
- Full Firecrawl batch registration.
- Advanced revenue analytics.
- WordPress plugin.
- Mainnet deployment.
- Multi-publisher enterprise workflows.

## Commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
cd anchor && anchor test
```

## Folder Architecture

- `app/`: Next.js App Router pages and API routes.
- `components/`: Shared UI components.
- `lib/sello/`: Sello metadata and license helpers.
- `lib/solana/`: Program IDs, PDA seed documentation, constants.
- `public/`: AI-readable policy files.
- `anchor/`: The only Anchor workspace, program name `sello`.
- `docs/`: Architecture, demo flow, limitations, postmortem.

## Hard Rules

- **Terminology**: Always use "Rights Checkout", "Proof of Consent", "x402-style payment", and "Solana devnet UsageReceipt".
- **Truth Rules**: Sello does not prove legal ownership; it records published terms for a content hash. Label devnet receipts clearly.
- Do not add old template program references.
- Do not claim production x402, LI.FI, Firecrawl, or ElevenLabs are production-ready until code supports them.
- Keep the README honest and judge-friendly.
- Keep generated files out of manual edits unless regenerating from IDL.
- Do not commit node_modules, target, .anchor, .next, logs, PDFs, or env files.
- Prefer one complete demo flow over many partial integrations.
