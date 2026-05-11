# Sello Protocol

Sello Protocol is a Proof of Consent layer for AI agents using web content.
Creators publish machine-readable terms, Solana keeps a public proof, and
agents can verify the rules before using articles, voices, or media.

Aval Newsrooms is the first demo product: a small publisher dashboard for
registering an article, exposing AI-readable policy files, and showing how a
responsible agent should check license terms.

## Why Proof of Consent?

AI agents can read, summarize, quote, train on, or narrate content faster than
humans can review permissions. Sello gives creators a simple way to say what is
allowed in a format agents can inspect.

## Why this is a protocol

Sello is not only a dashboard. It combines:

- A web standard: Sello meta tag, llms.txt, tdm-policy.json, rsl.txt.
- A Solana record: ContentSello as public proof of terms.
- A usage record: UsageReceipt when an agent uses content under those terms.

## Demo flow

1. Open `/blog/protected-article`.
2. Inspect `/llms.txt`, `/tdm-policy.json`, and `/rsl.txt`.
3. Call `/api/license?url=/blog/protected-article`.
4. Review `/register` and `/dashboard`.
5. Run the Anchor tests.

## What is implemented

- Next.js frontend demo.
- Aval Newsrooms registration and dashboard screens.
- Protected article with a Sello meta tag.
- AI-readable policy files.
- `/api/license` permission response.
- Anchor program named `sello`.
- ContentSello, UsageReceipt, VoiceConsent, and ProtocolConfig accounts.

## What is simulated or limited

- The UI does not yet submit Solana wallet transactions.
- The demo ContentSello PDA is a placeholder until registration is wired.
- `/api/narrate` is a stub, not production x402 or ElevenLabs.
- LI.FI, Firecrawl batch registration, analytics, and WordPress are roadmap.

## Tech stack

- Next.js 16 and React 19.
- TypeScript.
- Solana Anchor.
- Codama-generated client reference under `app/generated/sello`.

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

Create `Frontend/sello-colosseum-clean/.env.local` from `.env.example`. For the Appwrite narration path, `APPWRITE_API_KEY` is required; the clean app now defaults the non-secret Appwrite values to the source project (`sello-protocol`, `fn-narrate`, `sello-db`, `narrations`) when you do not override them.

## Test Anchor program

```bash
cd anchor
anchor test
```

## Why Solana

Proof of Consent needs cheap public timestamps and low-cost usage receipts.
Solana gives the demo fast finality, low fees, and USDC-compatible payment
paths for future agent workflows.

## Roadmap

- Wire the frontend to wallet-signed ContentSello registration.
- Regenerate the Codama client from the clean Anchor IDL.
- Add real UsageReceipt creation after licensed use.
- Replace `/api/narrate` stub with x402 and ElevenLabs.
- Add publisher analytics after the core flow is stable.
