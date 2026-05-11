# Demo Flow

## What judges can test

1. Run the app:

   ```bash
   pnpm install
   pnpm dev
   ```

2. Open `http://localhost:3000`.

3. Visit `Register` to see the generated Sello tag and PDA seeds.

4. Visit `Demo article` and inspect the page metadata. The article declares a
   Sello license.

5. Open policy files:

   - `http://localhost:3000/llms.txt`
   - `http://localhost:3000/tdm-policy.json`
   - `http://localhost:3000/rsl.txt`

6. Call the license endpoint:

   ```bash
   curl "http://localhost:3000/api/license?url=/blog/protected-article"
   ```

7. Check the Anchor program:

   ```bash
   cd anchor
   anchor test
   ```

## Expected result

The app demonstrates how an AI agent discovers content terms before use. The
Anchor program models the Solana proof layer with ContentSello and UsageReceipt
records.
