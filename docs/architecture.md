# Architecture: Sello Protocol

Sello Protocol is the **rights checkout for AI agents** using web content. It enables newsrooms to publish machine-readable rules, settle rights usage via x402-style payments, and record **Proof of Consent** on Solana.

## The Protocol Loop

The Sello architecture implements a complete cryptographic cycle:
**Publisher creates the checkout. Agent uses the checkout. Solana keeps the receipt.**

1. **Publish**: Creator publishes rules in HTML metadata and on-chain (ContentSello).
2. **Detect**: Agent detects AI-readable rights and executes an automated checkout.
3. **Settle**: Agent executes an **x402-style settlement** and unlocks the asset.
4. **Receipt**: Solana records the UsageReceipt (Proof of Consent) on devnet.

## Proof of Consent

Proof of Consent is the machine-readable evidence that usage terms were published for a content hash by a wallet or entity at a specific time.

It is **not** a deed of legal ownership; it is a cryptographic notary of intent and settlement. It provides a verifiable record that an agent followed the terms set by the content authority.

## The Web Signal Layer

Sello uses a multi-layered signaling strategy to ensure any agent can detect rights:

- **Sello Tag**: `<meta name="sello">` for per-page rights and payment endpoints.
- **llms.txt**: Human/AI hybrid rules at the domain root.
- **tdm-policy.json**: JSON-LD compliant policy for scrapers.
- **rsl.txt**: Technical rights signaling inspired by international frameworks.

**Legal Note**: These signals enable **machine-readable rights signaling aware of EU CDSM Art. 4** (TDM reservation). Sello does not guarantee legal compliance but provides the technical tools to facilitate it.

## Solana Protocol (Anchor)

The Anchor program (`anchor/programs/sello`) manages the source of truth for rights and receipts.

### PDA Seeds

- **ProtocolConfig**: `["config", authority]` - Fee and treasury settings.
- **ContentSello**: `["sello", creator, content_hash]` - The "Rights Registry" for a specific piece of content.
- **UsageReceipt**: `["receipt", content_sello, payer, timestamp]` - The "Proof of Consent" record.
- **VoiceConsent**: `["voice", creator]` - Authorized voice IDs for narration.

### Accounts

- **ContentSello**: Stores the machine-readable terms (Price, Attribution, Allowed Uses, No-Train).
- **UsageReceipt**: Records the act of consent (Who paid, what they did, when).

## Aval Newsrooms Demo

Aval is a **Revenue Console** and **Compliance Audit** tool for publishers. It allows newsrooms to:

1. **Create AI Checkouts**: Register their inventory on Sello.
2. **Monitor Revenue**: Track x402-style settlements from agents.
3. **Audit Compliance**: Generate Proof of Consent reports from the Solana ledger.

## Agent Integration

Agents use the **Sello Skill** (available for Claude Code, Codex, Gemini CLI) to automate the Rights Checkout flow. The skill handles:

1. Detecting the Sello tag.
2. Negotiating terms.
3. Executing the Solana transaction.
4. Unlocking the protected resource via the payment endpoint.
