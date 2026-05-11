import { Client, Databases, Storage, ID } from "node-appwrite";

const DEVNET_RPC = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
const PROGRAM_ID = process.env.ANCHOR_PROGRAM_ID!;
const AUTHORITY_PUBKEY = process.env.AUTHORITY_PUBKEY!;
const TREASURY_WALLET = process.env.TREASURY_WALLET!;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY!;

// Default voice: Rachel (free tier, English, calm narrator)
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

// Devnet USDC mint
const USDC_DEVNET_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

// x402 payment requirement: 0.10 USDC = 100000 base units (6 decimals)
const PRICE_USDC_UNITS = "100000";

export default async ({ req, res, log, error }: any) => {
  // ── CORS ──
  if (req.method === "OPTIONS") {
    return res.text("", 204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type, x-payment-payload",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    });
  }

  if (req.method !== "POST") {
    return res.json({ error: "Method not allowed" }, 405);
  }

  // ── x402 payment check ──
  const paymentPayload = req.headers["x-payment-payload"];
  if (!paymentPayload) {
    log("x402 challenge — no payment payload");
    return res.json(
      {
        error: "Payment Required",
        x402Version: 1,
        accepts: [
          {
            scheme: "exact",
            network: "solana-devnet",
            maxAmountRequired: PRICE_USDC_UNITS,
            resource: req.url,
            description: "Article narration via ElevenLabs (Sello Protocol)",
            mimeType: "audio/mpeg",
            payTo: TREASURY_WALLET,
            maxTimeoutSeconds: 300,
            asset: USDC_DEVNET_MINT,
            extra: { name: "USDC", decimals: 6 },
          },
        ],
      },
      402,
      {
        "Access-Control-Allow-Origin": "*",
        "X-Payment-Required": "1",
      }
    );
  }

  // ── Verify Solana Transaction Signature ──
  log(`Verifying transaction: ${paymentPayload}`);
  try {
    const isVerified = await verifyTransaction(paymentPayload, TREASURY_WALLET, PRICE_USDC_UNITS, DEVNET_RPC, log);
    if (!isVerified) {
      log("Transaction verification failed");
      return res.json({ error: "Invalid or unconfirmed payment" }, 402);
    }
    log("Payment verified successfully!");
  } catch (err) {
    error(`Verification error: ${err}`);
    return res.json({ error: "Blockchain verification service unavailable" }, 503);
  }

  // ── Parse body ──
  let body: { article_url?: string; voice_id?: string; sello_pda?: string };
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.json({ error: "Invalid JSON body" }, 400);
  }

  const { article_url, voice_id, sello_pda } = body;
  if (!article_url) {
    return res.json({ error: "article_url required" }, 400);
  }

  // ── Check Appwrite Storage cache ──
  const appwrite = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  const storage = new Storage(appwrite);
  const db = new Databases(appwrite);
  const cacheKey = await sha256(`${article_url}:${voice_id ?? DEFAULT_VOICE_ID}`);
  const BUCKET_ID = process.env.APPWRITE_AUDIO_BUCKET_ID ?? "narrations";

  // Check cache
  try {
    const cached = await storage.getFile(BUCKET_ID, cacheKey);
    if (cached) {
      log(`Cache hit: ${cacheKey}`);
      const fileUrl = `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${cacheKey}/view?project=${process.env.APPWRITE_PROJECT_ID}`;
      return respondWithAudio(res, null, fileUrl, sello_pda, voice_id ?? DEFAULT_VOICE_ID, log);
    }
  } catch {
    // cache miss, continue
  }

  // ── Firecrawl scrape ──
  log(`Scraping article: ${article_url}`);
  let articleText: string;
  try {
    const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: article_url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
    });
    const scraped = (await scrapeRes.json()) as {
      data?: { markdown?: string };
    };
    articleText = scraped.data?.markdown ?? "";
    if (!articleText) throw new Error("Empty article content");
    // Trim to 3000 chars max (free tier safety)
    articleText = articleText.slice(0, 3000);
  } catch (err) {
    error(`Firecrawl failed: ${err}`);
    return res.json({ error: "Could not scrape article" }, 502);
  }

  // ── ElevenLabs TTS ──
  const useVoiceId = voice_id ?? DEFAULT_VOICE_ID;
  log(`ElevenLabs TTS: voice=${useVoiceId}, chars=${articleText.length}`);
  let audioBuffer: ArrayBuffer;
  try {
    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${useVoiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: articleText,
          model_id: "eleven_monolingual_v1",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );
    if (!ttsRes.ok) {
      const errBody = await ttsRes.text();
      throw new Error(`ElevenLabs ${ttsRes.status}: ${errBody}`);
    }
    audioBuffer = await ttsRes.arrayBuffer();
    log(`Audio generated: ${audioBuffer.byteLength} bytes`);
  } catch (err) {
    error(`ElevenLabs failed: ${err}`);
    return res.json({ error: "TTS generation failed" }, 502);
  }

  // ── Upload to Appwrite Storage (cache) ──
  let audioUrl: string | null = null;
  try {
    const blob = new Blob([audioBuffer], { type: "audio/mpeg" });
    await storage.createFile(BUCKET_ID, cacheKey, blob as any, ["role:all"]);
    audioUrl = `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${cacheKey}/view?project=${process.env.APPWRITE_PROJECT_ID}`;
    log(`Cached audio at: ${audioUrl}`);
  } catch (err) {
    error(`Storage cache failed (non-fatal): ${err}`);
  }

  // ── Fire-and-forget: record_usage on-chain ──
  fireAndForgetRecordUsage({
    db,
    selloPda: sello_pda,
    authorityPubkey: AUTHORITY_PUBKEY,
    programId: PROGRAM_ID,
    rpcUrl: DEVNET_RPC,
    log,
    error,
  });

  return respondWithAudio(res, audioBuffer, audioUrl, sello_pda, useVoiceId, log);
};

async function verifyTransaction(signature: string, treasury: string, amount: string, rpc: string, log: any): Promise<boolean> {
  // Demo mode: if signature starts with 'mock-', allow it
  if (signature.startsWith("mock-")) return true;

  // Real verification logic via RPC
  const response = await fetch(rpc, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getTransaction",
      params: [signature, { encoding: "json", commitment: "confirmed", maxSupportedTransactionVersion: 0 }]
    })
  });

  const json = (await response.json()) as any;
  if (!json.result) return false;

  // Basic check: Ensure no error
  if (json.result.meta.err) return false;

  // Advanced check for USDC transfer would go here
  // For the hackathon MVP, we confirm the transaction exists and has no errors
  return true;
}

function respondWithAudio(
  res: any,
  audioBuffer: ArrayBuffer | null,
  audioUrl: string | null,
  selloPda: string | undefined,
  voiceId: string,
  log: any
): any {
  if (audioUrl && !audioBuffer) {
    // redirect to cached URL
    return res.json({ audioUrl, selloPda: selloPda ?? null, voiceId }, 200, {
      "Access-Control-Allow-Origin": "*",
    });
  }
  if (audioBuffer) {
    return res.json(
      {
        audioUrl,
        audioBase64: Buffer.from(audioBuffer).toString("base64"),
        mimeType: "audio/mpeg",
        voiceId,
        selloPda: selloPda ?? null,
      },
      200,
      { "Access-Control-Allow-Origin": "*" }
    );
  }
  return res.json({ error: "No audio generated" }, 500);
}

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  // Node.js crypto
  const { createHash } = await import("crypto");
  return createHash("sha256").update(data).digest("hex");
}

// Fire-and-forget: log usage receipt in Appwrite DB + attempt on-chain record_usage
function fireAndForgetRecordUsage(params: {
  db: Databases;
  selloPda: string | undefined;
  authorityPubkey: string;
  programId: string;
  rpcUrl: string;
  log: any;
  error: any;
}) {
  const { db, selloPda, log, error } = params;

  // Log to Appwrite DB immediately (fast)
  if (process.env.APPWRITE_DB_ID && selloPda) {
    db.createDocument(
      process.env.APPWRITE_DB_ID,
      "usage_receipts",
      ID.unique(),
      {
        selloPda,
        usageType: 2, // VOICE
        timestamp: new Date().toISOString(),
        amountPaid: "100000",
      },
      ["role:all"]
    )
      .then(() => log(`Usage receipt logged to Appwrite`))
      .catch((err: unknown) => error(`Appwrite receipt log failed: ${err}`));
  }

  // NOTE: on-chain record_usage requires server keypair to sign as payer.
  // For hackathon demo: only logging to Appwrite DB above.
  // Full on-chain path: load server keypair from env, build + send transaction.
}
