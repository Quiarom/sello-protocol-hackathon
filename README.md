# Sello Protocol

**Sello Protocol is the Rights Checkout for AI agents using newsroom content.**

Publisher creates the checkout. Agent uses the checkout. Solana keeps the receipt.

Sello turns AI content usage into a verifiable transaction loop: a publisher publishes machine-readable rights, an agent detects those terms, an **x402-style payment** is made for paid uses, and Solana records a **Proof of Consent** as a **Solana devnet UsageReceipt**.

This repository is the Colosseum MVP: a Next.js demo app, Aval Newsrooms dashboard, AI-readable policy files, and an Anchor program named `sello` deployed on Solana devnet.

---

## The pitch

Newsrooms are already being consumed by AI agents, but the web does not have a native checkout for content rights.

Today an agent can scrape, summarize, train, quote, narrate, or remix content before a publisher has any chance to express terms in a machine-readable way. Sello reframes the problem as checkout infrastructure:

| Actor                | What they need                                          | What Sello gives them                                                              |
| -------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Publisher / newsroom | A way to publish terms agents can read                  | Sello meta tag, `llms.txt`, `tdm-policy.json`, `rsl.txt`, and ContentSello records |
| AI agent             | A deterministic way to know what is allowed             | Rights Checkout detection, price, attribution, payment endpoint, on-chain PDA      |
| User / buyer         | A clean paid action                                     | x402-style payment and protected resource unlock                                   |
| Auditor / judge      | Evidence that terms existed and the agent followed them | Solana devnet UsageReceipt and Aval Newsrooms dashboard                            |

The wedge is simple: **paid AI voice narration for newsroom articles**. The broader protocol is any agentic use of web content where terms should be machine-readable and receipts should be public.

---

## Demo at a glance

| URL                       | Purpose                          | What to look for                                                                                         |
| ------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `/`                       | Landing page                     | Narrative overview of Rights Checkout and Proof of Consent                                               |
| `/blog/protected-article` | Protected demo article           | A Sello-tagged article with a staged agent checkout UI                                                   |
| `/register`               | Publisher onboarding             | Connect wallet, create an AI checkout, register ContentSello, generate tags/policy files                 |
| `/onboarding/agent`       | Agent onboarding                 | Connect agent wallet, run live Rights Checkout, pay, record Solana devnet UsageReceipt, unlock narration |
| `/dashboard`              | Aval Newsrooms creator dashboard | Protected inventory, protocol checks, evidence report                                                    |
| `/dashboard?view=agent`   | Agent registry dashboard         | Demo article, latest transaction, Solana devnet UsageReceipt context, ElevenLabs audio cache             |
| `/api/license?url=...`    | Rights detection API             | Parses Sello metadata, checks policy files, verifies ContentSello PDA                                    |
| `/api/narrate`            | Paid narration endpoint          | Proxies verified payment payload to the Appwrite/ElevenLabs narration function                           |
| `/api/narrations`         | Audio cache API                  | Lists generated narration files for the dashboard                                                        |
| `/llms.txt`               | AI-readable site policy          | High-level rules for agents                                                                              |
| `/tdm-policy.json`        | Structured TDM policy            | JSON machine-readable rights policy                                                                      |
| `/rsl.txt`                | Rights signal file               | Compact rights reservation and Proof of Consent pointer                                                  |

---

## User flows

### 1. Publisher creates the checkout

Path: `/register`

1. Publisher connects a devnet wallet.
2. Publisher initializes their Sello profile / settlement identity.
3. Publisher enters an article URL, author, publisher name, license mode, price, and voice settings.
4. The app derives a content hash and ContentSello PDA.
5. The wallet signs `register_content_sello`.
6. The app outputs:
   - `<meta name="sello" ...>` tag;
   - `llms.txt` rules;
   - `tdm-policy.json` rules;
   - `rsl.txt` signal;
   - Solana Explorer links.

Result: the publisher has created a machine-readable Rights Checkout for a content hash.

### 2. Agent uses the checkout

Path: `/onboarding/agent`

1. Agent selects intended use, e.g. voice narration.
2. Agent connects a devnet wallet used as the UsageReceipt authority.
3. Agent tests a URL, usually `/blog/protected-article`.
4. `/api/license` detects:
   - Sello meta tag;
   - `llms.txt`;
   - `tdm-policy.json`;
   - ContentSello PDA on Solana devnet.
5. Agent sees that summarization/quotation are allowed with attribution, while voice narration requires payment.
6. Agent signs one transaction containing:
   - devnet USDC transfer instruction;
   - small SOL transfer for visible demo history;
   - `record_usage_receipt` instruction.
7. `/api/narrate` unlocks generated narration after the x402-style payment payload is submitted.
8. Dashboard stores the latest demo context locally and shows the generated ElevenLabs audio.

Result: the agent has used the Rights Checkout and left a Proof of Consent as a Solana devnet UsageReceipt.

### 3. Aval Newsrooms monitors evidence

Path: `/dashboard` and `/dashboard?view=agent`

Aval Newsrooms is the publisher-facing console. In this MVP it shows:

- protected demo article inventory;
- ContentSello PDA;
- protocol signal checks;
- evidence report generation;
- latest agent checkout transaction;
- generated ElevenLabs audio;
- Solana devnet links for verification.

Result: the newsroom can demonstrate rights detection, x402-style payment, Proof of Consent, and audit evidence in one place.

---

## Smart contract layer

The Anchor workspace lives in `anchor/`. The program is named `sello`.

| Field                                    | Value                                          |
| ---------------------------------------- | ---------------------------------------------- |
| Program                                  | `sello`                                        |
| Cluster                                  | Solana devnet                                  |
| Program ID                               | `3P8km3sUTKc5EZywxVxPoFFFJzPxWGjVHtKLSU2iy7mY` |
| ProgramData                              | `7av8N2Gm9yFbop5ALPGth7tKHBEUyfkRynGQta63Gav9` |
| Upgrade authority used for latest deploy | `Y5GHe2xYz9ThBZsGN7VVJuSyjXNrkoGg1E2AJrNQYwN`  |
| Latest verified deploy slot              | `461774329`                                    |

### Instructions

| Instruction              | Purpose                                            | Main inputs                                                                                 | Effect                                              |
| ------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `initialize_config`      | Creates protocol configuration for an authority    | `fee_bps`, `treasury`                                                                       | Stores authority, treasury, fee bps, active flag    |
| `register_content_sello` | Registers the publisher's terms for a content hash | `content_hash`, `license_type`, `allowed_uses`, `attribution_required`, `price_usdc_micros` | Creates ContentSello PDA                            |
| `record_usage_receipt`   | Records Proof of Consent for a paid/allowed use    | `usage_type`, `amount_paid_micros`, `timestamp`                                             | Creates UsageReceipt PDA and increments usage count |
| `grant_voice_consent`    | Optional voice-specific consent record             | `voice_id_hash`, `allowed_use`, `price_usdc_micros`                                         | Creates VoiceConsent PDA                            |
| `revoke_content_sello`   | Revokes a content terms record                     | ContentSello + creator signer                                                               | Marks ContentSello as revoked                       |

### PDA seeds

| Account          | Seeds                                          | Meaning                                              |
| ---------------- | ---------------------------------------------- | ---------------------------------------------------- |
| `ProtocolConfig` | `['config', authority]`                        | Protocol fee/treasury settings for an authority      |
| `ContentSello`   | `['sello', creator, content_hash]`             | Rights Checkout record for one piece of content      |
| `UsageReceipt`   | `['receipt', content_sello, payer, timestamp]` | Proof that one agent/payer used a checkout at a time |
| `VoiceConsent`   | `['voice', creator]`                           | Optional small voice consent account                 |

### Accounts

#### `ContentSello`

Stores the publisher-created checkout terms.

| Field                  | Meaning                                    |
| ---------------------- | ------------------------------------------ |
| `creator`              | Wallet/entity publishing the terms         |
| `content_hash`         | 32-byte hash of the content identifier     |
| `license_type`         | Numeric license mode used by the client    |
| `allowed_uses`         | Bitmask for summarize, quote, voice, train |
| `attribution_required` | Whether attribution is required            |
| `price_usdc_micros`    | Price in USDC micros                       |
| `usage_count`          | Number of recorded UsageReceipts           |
| `revoked`              | Whether the terms are revoked              |
| `created_at`           | On-chain timestamp                         |
| `bump`                 | PDA bump                                   |

Current account size asserted by tests: `8 + 93 = 101` bytes.

#### `UsageReceipt`

Stores the agent-side Proof of Consent.

| Field                | Meaning                               |
| -------------------- | ------------------------------------- |
| `content_sello`      | ContentSello PDA used by the agent    |
| `payer`              | Agent wallet / UsageReceipt authority |
| `usage_type`         | Use performed, e.g. voice narration   |
| `amount_paid_micros` | Amount paid in USDC micros            |
| `timestamp`          | Receipt timestamp                     |
| `bump`               | PDA bump                              |

Current account size asserted by tests: `8 + 82 = 90` bytes.

#### `ProtocolConfig`

Stores authority and treasury configuration. Current account size asserted by tests: `8 + 68 = 76` bytes.

#### `VoiceConsent`

Small optional account for voice-specific permission. Current account size asserted by tests: `8 + 83 = 91` bytes.

### Contract truth rules

- Sello does **not** prove legal ownership of content.
- Sello records that a wallet/entity published terms for a content hash.
- A UsageReceipt records that an agent/payer interacted with those terms.
- Receipts in this MVP are **Solana devnet UsageReceipts**.
- Production x402 middleware, production LI.FI bridge, production Firecrawl batch registration, and mainnet deployment are intentionally out of scope.

---

## Web signal layer

Sello publishes rights in several formats so both browsers and agents can discover them.

### Sello meta tag

The protected article publishes a compact page-level signal:

```html
<meta
  name="sello"
  content="id:art-001|license:sello-voice|author:Daniel Patete|publisher:Aval Newsrooms|pay:/api/narrate|onchain:solana:devnet:AbBDUHP6sa4bS7cUVhxFaCTSr5Pw3tv42yno7FRaSf4S|price_usdc:0.10|voice_id:Rachel (Default)"
/>
```

The agent can parse this without a custom legal contract parser. It gets the license, attribution, price, payment endpoint, and ContentSello PDA.

### Policy files

| File                     | Role                                                |
| ------------------------ | --------------------------------------------------- |
| `public/llms.txt`        | Human-readable and agent-readable usage rules       |
| `public/tdm-policy.json` | Structured policy for TDM / scraper-aware usage     |
| `public/rsl.txt`         | Compact rights signal with Proof of Consent pointer |

These files make Sello **machine-readable rights signaling aware of EU CDSM Art. 4**. They are technical signals, not a guarantee of legal compliance.

---

## Application architecture

| Path                   | Responsibility                                      |
| ---------------------- | --------------------------------------------------- |
| `app/`                 | Next.js App Router pages and API routes             |
| `app/components/`      | Landing, onboarding, dashboard, checkout UI         |
| `app/generated/sello/` | Generated Solana client snapshot from Anchor/Codama |
| `app/lib/sello/`       | License constants, Sello meta tag helpers, parsers  |
| `app/lib/wallet/`      | Wallet Standard integration and transaction signer  |
| `app/lib/solana/`      | Program constants and Solana utilities              |
| `anchor/`              | Anchor workspace and `sello` program                |
| `public/`              | AI-readable policy files                            |
| `docs/`                | Architecture, demo flow, limitations, postmortem    |
| `functions/`           | Appwrite narration function assets                  |
| `scripts/`             | Preflight and demo helper scripts                   |

### API routes

| Route                      | What it does                                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| `GET /api/license?url=...` | Scrapes/fetches a URL, parses Sello metadata, probes policy files, verifies ContentSello PDA |
| `POST /api/narrate`        | Accepts the x402-style payment payload and calls the Appwrite narration function             |
| `GET /api/narrations`      | Lists cached generated narration files for Aval dashboard                                    |

---

## Local development

### Requirements

- Node.js / pnpm
- Rust toolchain
- Solana CLI
- Anchor CLI
- A Solana devnet wallet for end-to-end transaction tests

### Install and run

```bash
pnpm install
pnpm dev
```

Open:

```text
http://localhost:3000
```

### Useful commands

```bash
pnpm lint
pnpm build
pnpm preflight
pnpm anchor-build
pnpm anchor-test
cd anchor && cargo test
```

For devnet deploy/test with the correct authority wallet:

```bash
cd anchor
NO_DNA=1 anchor deploy \
  --provider.cluster devnet \
  --provider.wallet ~/.config/solana/id-sello-devnet.json

NO_DNA=1 anchor test \
  --provider.cluster devnet \
  --provider.wallet ~/.config/solana/id-sello-devnet.json
```

Note: `anchor test` can deploy before running the configured test script. Use `cargo test` when you only want local Rust unit tests and do not want to sign or deploy.

---

## Environment notes

The demo can run locally without every production integration, but the full narration unlock needs the server-side narration environment.

| Variable                          | Purpose                                              |
| --------------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_PROGRAM_ID`          | Sello devnet program ID                              |
| `NEXT_PUBLIC_RPC_URL`             | Solana RPC endpoint used by app code                 |
| `NEXT_PUBLIC_APPWRITE_ENDPOINT`   | Appwrite endpoint                                    |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | Appwrite project                                     |
| `APPWRITE_API_KEY`                | Server-side Appwrite execution key                   |
| `APPWRITE_FUNCTION_ID`            | Narration function ID                                |
| `ELEVENLABS_API_KEY`              | Required by the narration function to generate audio |

If `ELEVENLABS_API_KEY` is missing, the Rights Checkout and Solana devnet UsageReceipt flow can still be tested up to payment/receipt behavior, but final ElevenLabs narration may fail.

---

## What is implemented

- Next.js demo app.
- Aval Newsrooms dashboard.
- Publisher registration screen.
- Agent onboarding and live Rights Checkout flow.
- Sello meta tag.
- `llms.txt`, `tdm-policy.json`, `rsl.txt`.
- Anchor program named `sello`.
- ContentSello, UsageReceipt, ProtocolConfig, and optional VoiceConsent accounts.
- Codama-generated client snapshot in `app/generated/sello`.
- Solana devnet deployment for the current program ID.
- Dashboard display for latest local agent demo, transaction, ContentSello PDA, and ElevenLabs audio cache.

---

## What is intentionally limited

- No production x402 middleware claim.
- No production LI.FI bridge claim.
- No production Firecrawl batch registration claim.
- No production ElevenLabs guarantee unless Appwrite function and keys are configured.
- No advanced revenue analytics.
- No WordPress plugin.
- No mainnet deployment.
- No multi-publisher enterprise workflow.
- No claim that Sello proves legal ownership.

The MVP optimizes for one complete judge-friendly loop over many partial integrations.

---

## Verification status

Recently verified locally:

```bash
pnpm lint
pnpm build
cd anchor && cargo test
```

Devnet deployment verified:

- Program ID: `3P8km3sUTKc5EZywxVxPoFFFJzPxWGjVHtKLSU2iy7mY`
- Upgrade authority: `Y5GHe2xYz9ThBZsGN7VVJuSyjXNrkoGg1E2AJrNQYwN`
- Latest deploy slot observed: `461774329`
- Example deploy signatures:
  - `5FsS7uxj5vibDgFMJDerQftEeMQTivoETu251DUXa3nbJzB5u8Sp5ay9uRGFdfD9X4tmzwfALfmeTVD56JAyth7w`
  - `295H3a87ZYv2aYtFAPYwGQnhVxXAZcRfqdBgXWMy6KF4BMMmGGEET6T56QjWnHgTBB7mC85p19EQyXbLCqTcDTof`

---

## Why Solana

Rights Checkout needs low-cost public receipts. Agent usage can be high-frequency and low-value, so receipts must be cheap enough to create often and fast enough to fit into automated flows.

Solana gives Sello:

- cheap public timestamps;
- fast confirmation;
- PDA-based account derivation;
- USDC-compatible payment paths;
- a public ledger for agent-readable Proof of Consent.

---

## One-line summary

**Sello Protocol is Stripe Checkout for AI content rights: publishers publish terms, agents pay for allowed uses, and Solana devnet records the receipt.**
