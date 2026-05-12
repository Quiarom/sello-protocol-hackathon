# Limitations & Narrative Truths

## Implemented

- **Agent Rights Checkout Flow**: A 5-stage functional demo showing an agent detecting, negotiating, and settling rights on-chain.
- **Aval Revenue Console**: A newsroom-focused dashboard for monitoring rights revenue and Proof of Consent receipts.
- **Create AI Checkout**: A wallet-signed registration flow that generates machine-readable policy files and Solana ContentSello records.
- **Solana Protocol**: Anchor program managing ContentSello (Rules) and UsageReceipt (Proof of Consent) on devnet.
- **Policy Signals**: Automated generation of `llms.txt`, `tdm-policy.json`, and `rsl.txt`.

## Narrative Truths

- **Proof of Consent**: Sello does **not** prove legal ownership of content. It records that usage terms were published for a content hash by a wallet or entity at a specific time.
- **x402 Settlement**: The payment flow in the demo is an **x402-style settlement** for devnet. It simulates the automated USDC transfer and subsequent unlocking of the protected resource.
- **Rights Signaling**: The system provides **machine-readable rights signaling aware of EU CDSM Art. 4**. It is a technical tool for awareness, not a guarantee of legal compliance.
- **Receipts**: All receipts in the demo are **Solana devnet UsageReceipts**.

## Technical Limitations / Roadmap

- **Production Settlement**: While the protocol logic for payments exists, the actual production-ready x402 treasury settlement and automated USDC distribution is a roadmap item.
- **Crawl Automation**: The `/api/license` response is based on the current demo environment. Integration with high-scale crawlers like Firecrawl is planned.
- **Audio Generation**: Narration via ElevenLabs requires the Appwrite function (`fn-narrate`) to be fully configured with valid API keys.
- **Codama Sync**: The `app/generated/sello` client is a snapshot. In a production workflow, this would be auto-generated from the Anchor program IDL in a CI pipeline.
- **Persistence**: Registration state is recomputed from the wallet and content hash in the demo; production would involve a database for tracking all publisher inventory.
