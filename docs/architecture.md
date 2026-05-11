# Architecture

## Sello Protocol

Sello Protocol is a Proof of Consent layer for AI agents using web content.
Creators publish machine-readable usage terms, anchor those terms on Solana,
and can record usage receipts when agents use the content responsibly.

## Proof of Consent

Proof of Consent means the creator made their terms public in a form that
software can inspect. Sello does not prevent every misuse. It creates a public
timestamp and a repeatable verification path:

1. Read the Sello tag and policy files.
2. Verify the matching Solana record.
3. Follow the permitted use rules.
4. Record a UsageReceipt when paid or licensed use happens.

## Sello Standards

The web layer is intentionally simple:

- `<meta name="sello">` on the article page.
- `/llms.txt` for direct agent instructions.
- `/tdm-policy.json` for TDM-compatible policy.
- `/rsl.txt` for crawler rights signaling.

## Solana Sello Program

The Anchor program lives in `anchor/programs/sello`.

PDA seeds:

- ProtocolConfig: `["config", authority]`
- ContentSello: `["sello", creator, content_hash]`
- UsageReceipt: `["receipt", content_sello, payer, timestamp_le_bytes]`
- VoiceConsent: `["voice", creator]`

Accounts:

- `ContentSello`: creator, content hash, license type, allowed uses,
  attribution requirement, price, status, timestamp, and usage count.
- `UsageReceipt`: content record, payer, usage type, amount, timestamp.
- `VoiceConsent`: optional voice consent for narration flows.
- `ProtocolConfig`: optional treasury and fee configuration.

## Aval Newsrooms Demo

Aval Newsrooms is the first product surface. The clean demo focuses on one
publisher, one article, and one license. This keeps the submission testable and
avoids overstating integrations that are not production-ready in this folder.

## Full Demo Flow

1. Open `/blog/protected-article`.
2. Inspect the generated Sello meta tag.
3. Open `/llms.txt`, `/tdm-policy.json`, and `/rsl.txt`.
4. Call `/api/license?url=/blog/protected-article`.
5. Review the Anchor program accounts and instructions.
6. Run `cd anchor && anchor test`.
