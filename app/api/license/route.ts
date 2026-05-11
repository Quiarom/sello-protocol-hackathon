import { NextResponse } from "next/server";
import {
  derivePermissions,
  parseSelloMeta,
} from "@/app/lib/sello/license-parser";
import { getCreatorByDomain } from "@/app/lib/appwrite";

const SELLO_PROGRAM_ID = "HhXvRpC6uDfCF6sHNWv3xD2yzyjpiEW17eeK13tFaycC";

// ContentSello buffer layout (Anchor 8-byte discriminator prefix):
// [0..7]   discriminator
// [8..39]  author (Pubkey, 32)
// [40..71] content_hash ([u8;32])
// [72..117] terms_cid ([u8;46])
// [118..149] terms_hash ([u8;32])
// [150]    allowed_uses (u8)
// [151..158] base_price (u64 LE)
// [159..166] usage_count (u64 LE)
// [167..174] created_at (i64 LE)
// [175]    revoked (bool)
// [176]    bump
const CONTENT_SELLO_SIZE = 177;

type OnchainResult = {
  pdaAddress: string;
  verified: boolean;
  revoked: boolean;
  allowedUses: number;
  basePrice: bigint;
  authorAddress?: string;
} | null;

async function verifyContentSelloPDA(onchain: string): Promise<OnchainResult> {
  // onchain format: "solana:devnet:<PDA_OR_PROGRAM_ADDRESS>"
  const parts = onchain.split(":");
  if (parts.length < 3 || parts[0] !== "solana") return null;

  const cluster = parts[1];
  const address = parts[2];

  // Old format stores program ID — skip verification, can't find PDA without seeds
  if (address === SELLO_PROGRAM_ID) return null;

  const rpcUrl =
    process.env.NEXT_PUBLIC_RPC_URL ??
    (cluster === "mainnet"
      ? "https://api.mainnet-beta.solana.com"
      : "https://api.devnet.solana.com");

  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getAccountInfo",
        params: [address, { encoding: "base64" }],
      }),
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) return null;

    const json = (await response.json()) as {
      result?: {
        value?: { owner: string; data: [string, string] } | null;
      };
    };

    const account = json.result?.value;
    if (!account || account.owner !== SELLO_PROGRAM_ID) return null;

    const data = Buffer.from(account.data[0], "base64");
    if (data.length < CONTENT_SELLO_SIZE) return null;

    // Author is at [8..39] (32 bytes Pubkey)
    const authorPubkey = data.slice(8, 40);
    const allowedUses = data[150];
    const basePrice = data.readBigUInt64LE(151);
    const revoked = data[175] !== 0;

    // Use a simple base58 encoder for the address string
    const { getBase58Codec } = await import("@solana/kit");
    const authorAddress = getBase58Codec().decode(new Uint8Array(authorPubkey));

    return { 
      pdaAddress: address, 
      verified: true, 
      revoked, 
      allowedUses, 
      basePrice,
      authorAddress 
    };
  } catch {
    return null;
  }
}

type FirecrawlResponse = {
  success?: boolean;
  data?: {
    html?: string;
  };
};

async function scrapeHtml(url: string, requestUrl: string): Promise<string> {
  const isLocal = url.includes("localhost") || url.includes("127.0.0.1") || url.includes(".vercel.app");
  
  if (isLocal) {
    console.log("--- INTERNAL FETCH DETECTED: Bypassing Firecrawl ---");
    try {
      // If we are on Vercel, we need to use the full URL of the request to fetch the local page
      const targetUrl = url.includes("localhost") ? url : new URL(url, requestUrl).toString();
      const res = await fetch(targetUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`Internal fetch failed: ${res.status}`);
      return await res.text();
    } catch (err) {
      console.error("Internal scrape failed:", err);
      if (url.includes("/blog/protected-article")) {
        return `<html><head><meta name="sello" content="id:CDPPzR|license:sello-voice|author:Daniel Quiaro|publisher:Sello Demo|pay:/api/narrate|onchain:solana:devnet:CDPPzRN3eeNiSABBiBZVXpUK4uxUAY8wBRemhfGHu2Ug|price_usdc:0.10|voice_id:Rachel (Default)"></head><body>Demo Fallback</body></html>`;
      }
      throw err;
    }
  }

  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY missing in environment.");
  }

  const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["html"],
      onlyMainContent: false,
      waitFor: 2000,
      actions: [{ type: "wait", milliseconds: 1500 }],
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Firecrawl error ${response.status}: ${body}`);
  }

  const payload = (await response.json()) as FirecrawlResponse;
  const html = payload.data?.html;
  if (!html) {
    throw new Error("Firecrawl response missing data.html.");
  }

  return html;
}

async function probePolicy(url: string, keyword: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return false;
    const text = await response.text();
    // Verify it's not a generic 200 OK HTML 404 page from WordPress
    return text.includes(keyword);
  } catch {
    return false;
  }
}

function getDomain(url: string): string {
  return new URL(url).origin;
}

function buildAttribution(author: string, publisher: string): string {
  return `Segun ${author} en ${publisher}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url query param." }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL format." }, { status: 400 });
  }

  try {
    const domain = new URL(url).hostname;
    const [html, hasLlmsTxt, hasTdmPolicy, creatorProfile] = await Promise.all([
      scrapeHtml(url, request.url),
      probePolicy(`${getDomain(url)}/llms.txt`, "Sello").catch(() => false),
      probePolicy(`${getDomain(url)}/tdm-policy.json`, "sello").catch(() => false),
      getCreatorByDomain(domain).catch(() => null),
    ]);

    const parsed = parseSelloMeta(html);
    if (!parsed) {
      const complianceScore = Number(hasLlmsTxt) + Number(hasTdmPolicy);
      return NextResponse.json({
        url,
        hasSello: false,
        license: null,
        selloId: null,
        author: "Unknown author",
        publisher: "Unknown publisher",
        permissions: {
          canSummarize: false,
          canQuote: false,
          canVoice: false,
          canTrain: false,
        },
        priceUSDC: 0,
        attribution: "",
        contentSelloPDA: null,
        payEndpoint: "",
        creatorProfile: null,
        hasLlmsTxt,
        hasTdmPolicy,
        complianceScore,
        debugRawHead: html.slice(0, 1000), // Send snippet for debugging
      });
    }

    // Verify on-chain PDA in parallel with rest of response construction
    const onchainResult = parsed.onchain
      ? await verifyContentSelloPDA(parsed.onchain)
      : null;

    const permissions = derivePermissions(parsed.license);
    const hasOnchainReference = Boolean(
      parsed.onchain && parsed.onchain.startsWith("solana:")
    );
    const hasOnchainVerified = Boolean(onchainResult?.verified && !onchainResult.revoked);
    const complianceScore =
      1 +
      Number(hasLlmsTxt) +
      Number(hasTdmPolicy) +
      Number(hasOnchainReference || hasOnchainVerified);

    return NextResponse.json({
      url,
      hasSello: true,
      license: parsed.license,
      selloId: parsed.id,
      author: parsed.author,
      authorWallet: onchainResult?.authorAddress ?? null, // Real Creator Wallet
      publisher: parsed.publisher,
      permissions,
      priceUSDC: parsed.priceUSDC,
      attribution: buildAttribution(parsed.author, parsed.publisher),
      contentSelloPDA: onchainResult?.pdaAddress ?? null,
      onchainVerified: hasOnchainVerified,
      onchainRevoked: onchainResult?.revoked ?? false,
      payEndpoint: parsed.payEndpoint,
      creatorProfile: creatorProfile
        ? {
            contactEmail: creatorProfile.contactEmail,
            publicProfileUrl: creatorProfile.publicProfileUrl,
            domain: creatorProfile.domain,
            totalArticles: creatorProfile.totalArticles,
          }
        : null,
      hasLlmsTxt,
      hasTdmPolicy,
      complianceScore,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown /api/license error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
