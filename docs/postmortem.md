# Postmortem

The Dev3Pack draft tried to show the whole Sello vision at once: payments,
voice, scraping, bridge UX, dashboards, standards, and legal narrative.

For Colosseum, the repo was tightened around one complete story:

**Publisher creates the checkout. Agent uses the checkout. Solana keeps the receipt.**

## The Evolution

- **Dev3Pack Version**: A broad Proof of Consent protocol for AI-era licensing. It was a strong concept but too broad and legal-heavy.
- **Colosseum Version**: The rights checkout for AI agents using newsroom content.

The new version keeps the technical core of **Proof of Consent** but makes it transactional and focused. Sello now prioritizes agent rights detection, **x402-style payment**, Solana on-chain receipts, and publisher revenue/evidence via **Aval Newsrooms**.

**x402 handles the payment. Sello records the consent. Aval shows the revenue.**

The result is less flashy but easier to judge. The protocol claim is now tied to
code that exists in the clean folder, and integrations that are not implemented
are documented as demo or roadmap work.
