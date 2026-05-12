# Demo Flow: Rights Checkout for AI Agents

## Core Narrative

This demo showcases how a newsroom (Aval) uses Sello Protocol to implement an automated **rights checkout** for AI agents.

**Publisher creates the checkout. Agent uses the checkout. Solana keeps the receipt.**

1. **Detection**: An AI agent arrives at a news article.
2. **Negotiation**: The agent detects a Sello tag and parses machine-readable rules.
3. **Settlement**: The agent executes an **x402-style settlement** for a paid action (e.g., voice narration).
4. **Receipt**: Solana records the **Proof of Consent** (Solana devnet UsageReceipt).
5. **Audit**: The newsroom monitors revenue and evidence in the **Aval Revenue Console**.

## What Judges Can Test

1. **Start the App**:

   ```bash
   pnpm install
   pnpm dev
   ```

2. **Rights Checkout Demo**:
   - Visit `http://localhost:3000/blog/protected-article`.
   - Step through the 5-stage checkout simulation (Discovery -> Rights -> Settlement -> Consent -> Audit).

3. **Aval Revenue Console**:
   - Visit `http://localhost:3000/dashboard`.
   - Monitor the "Protected Inventory" and "Rights Revenue" (simulated for devnet).
   - Generate a "Rights Compliance Audit".

4. **Create AI Checkout**:
   - Visit `http://localhost:3000/register`.
   - Step 1: Connect wallet to establish "Identity".
   - Step 2: "Create AI Checkout" by defining rules for a content hash.
   - Step 3: Inspect the generated Sello tag and policy files.

5. **Agent Onboarding**:
   - Visit `http://localhost:3000/onboarding/agent`.
   - See how developers integrate the Sello Skill for automated rights settlement.

6. **Machine-Readable Signals**:
   - `/llms.txt`: Human/AI hybrid rules.
   - `/tdm-policy.json`: JSON structure for scrapers.
   - `/rsl.txt`: Technical rights signals.

7. **Anchor Protocol Layer**:
   - `cd anchor && anchor test`
   - Verify the protocol logic for ContentSello and UsageReceipt records.

## Expected Result

The judge should see a functional prototype of an **Agent Rights Checkout** that transforms content into an AI-ready asset with automated settlement and on-chain Proof of Consent.
