# Sello Protocol

Sello Protocol is the **rights checkout for AI agents** using newsroom content.
Creators publish machine-readable rules, Solana records the **Proof of Consent**, and
agents use automated checkouts to pay for usage (x402) and verify permissions.

## The Colosseum Story

The original Dev3Pack version positioned Sello as a broad Proof of Consent protocol for AI-era content. While that was a strong vision, it was too broad and legal-first.

The Colosseum version transforms that vision into a clear, transactional product flow:
**Publisher creates the checkout. Agent uses the checkout. Solana keeps the receipt.**

Sello now focuses on agent rights detection, **x402-style payment**, Solana on-chain receipts, and publisher revenue/evidence reports via **Aval Newsrooms**.

## Core Loop

1. **Publish**: The publisher creates the checkout by defining rules (Price, Attribution, No-Train).
2. **Detect**: Agents detect Sello tags and machine-readable rights before using content.
3. **Settle**: Agents execute an **x402-style settlement** for paid actions like voice narration.
4. **Record**: Solana records the **Proof of Consent** (UsageReceipt) on devnet.
5. **Monitor**: Aval Newsrooms shows evidence, agent requests, and rights revenue.

## Why Proof of Consent?

Proof of Consent is the machine-readable evidence that usage terms were published
for a content hash by a wallet or entity at a specific time. It allows agents to
verify what is allowed (attribution, payment, or restricted) before they use content,
voices, or media.

**Note**: Sello does not prove legal ownership of content; it records that a specific entity published terms and an agent followed them.

## Key Features

- **Agent Rights Checkout**: Instant rights detection and settlement for autonomous agents.
- **Proof of Consent**: Immutable on-chain record of published rules and usage receipts.
- **Aval Newsrooms**: Revenue console and compliance audit for high-end newsroom content.
- **EU CDSM Art. 4 Aware**: Machine-readable rights reservation inspired by international frameworks.

## Demo Flow

1. **Rights Checkout Demo**: Open `/blog/protected-article` to see the 5-stage agent checkout.
2. **Aval Revenue Console**: Review `/dashboard` to monitor rights revenue and receipts.
3. **Create AI Checkout**: Use `/register` to publish rules for a new content hash.
4. **Integration**: Check `/onboarding/agent` to see how agents automate compliance.
5. **Protocol Signals**: Inspect `/llms.txt`, `/tdm-policy.json`, and `/rsl.txt`.

## What is Implemented

- **Rights Checkout UI**: Phased demo of an agent identifying terms and settling via x402.
- **Aval Dashboard**: Revenue metrics, protected inventory list, and compliance audit.
- **Creator Onboarding**: "Create AI Checkout" flow with wallet-signed registration.
- **Solana Protocol**: Anchor program for Proof of Consent (ContentSello, UsageReceipt).
- **Policy Signals**: Automated generator for AI-readable rules.

## What is Simulated or Limited

- **x402-style settlement**: Currently a devnet simulation of the payment flow.
- **Proof of Consent Receipts**: Labeled as "Devnet/Demo" until production launch.
- **Production Settlement**: Sello records the consent, but production treasury settlement is a roadmap item.
- **Crawl Detection**: `/api/license` provides a response based on the current demo state.

## Tech Stack

- Next.js 16 and React 19.
- TypeScript + Tailwind CSS 4.
- Solana Anchor + Codama.

## Run Locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Why Solana

Rights Checkout needs cheap public timestamps and low-cost usage receipts.
Solana provides the fast finality and USDC-compatible payment paths required
for high-frequency agent workflows.
