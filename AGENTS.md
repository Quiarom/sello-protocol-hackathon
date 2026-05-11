# AGENTS.md

## Goal

Sello Protocol is a Proof of Consent protocol for AI agents using web content.
The Colosseum MVP demonstrates one publisher, one article, one license, one
Solana consent record, and one usage receipt model.

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

- Do not add old template program references.
- Do not claim x402, LI.FI, Firecrawl, or ElevenLabs are production-ready until
  code supports them.
- Keep the README honest and judge-friendly.
- Keep generated files out of manual edits unless regenerating from IDL.
- Do not commit node_modules, target, .anchor, .next, logs, PDFs, or env files.
- Prefer one complete demo flow over many partial integrations.
