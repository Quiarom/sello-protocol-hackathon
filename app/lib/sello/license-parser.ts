import {
  LICENSE_CONFIG,
  selloCheckoutConfig,
  selloDemoArticle,
  type SelloLicenseKey,
} from "./constants";
import { getAllowedUseMask, hasAllowedUse } from "./checkout-model";

export type ParsedSelloTag = {
  id: string | null;
  license: SelloLicenseKey | null;
  author: string;
  publisher: string;
  payEndpoint: string;
  onchain: string | null;
  priceUSDC: number;
  voiceId: string | null;
};

export function parseSelloMeta(html: string): ParsedSelloTag | null {
  const metaTags = html.match(/<meta\s+[^>]+>/gi);
  if (!metaTags) return null;

  const selloTag = metaTags.find((tag) => tag.match(/name=["']sello["']/i));

  if (!selloTag) {
    const fallbackTag = metaTags.find((tag) =>
      tag.toLowerCase().includes("sello")
    );
    if (fallbackTag) return extractFromTag(fallbackTag);
    return null;
  }

  return extractFromTag(selloTag);
}

function extractFromTag(tag: string): ParsedSelloTag | null {
  const contentMatch = tag.match(/content=["']([^"']+)["']/i);
  if (!contentMatch) return null;

  const fields = parseSelloContent(contentMatch[1]);
  const license = normalizeLicense(fields.license);
  const parsedPrice = Number(
    fields.price_usdc ?? selloCheckoutConfig.narrationPrice.amountUSDC
  );

  return {
    id: fields.id ?? null,
    license,
    author: fields.author ?? selloDemoArticle.author,
    publisher: fields.publisher ?? selloDemoArticle.publisher.name,
    payEndpoint: fields.pay ?? selloCheckoutConfig.meta.pay,
    onchain: fields.onchain ?? null,
    priceUSDC: Number.isFinite(parsedPrice)
      ? parsedPrice
      : Number(selloCheckoutConfig.narrationPrice.amountUSDC),
    voiceId: fields.voice_id ?? selloCheckoutConfig.meta.voiceId,
  };
}

export function derivePermissions(license: SelloLicenseKey | null): {
  canSummarize: boolean;
  canQuote: boolean;
  canVoice: boolean | "paid";
  canTrain: boolean;
} {
  if (!license) {
    return {
      canSummarize: false,
      canQuote: false,
      canVoice: false,
      canTrain: false,
    };
  }

  const config = LICENSE_CONFIG[license];
  const allowedUses = config.allowedUses;
  const paidUses = selloCheckoutConfig.paidUses as readonly string[];
  const paidVoice =
    paidUses.includes("voice") && license === selloCheckoutConfig.license.key;

  return {
    canSummarize: hasAllowedUse(allowedUses, "summarize"),
    canQuote: hasAllowedUse(allowedUses, "quote"),
    canVoice: paidVoice ? "paid" : hasAllowedUse(allowedUses, "voice"),
    canTrain:
      config.trainingStatus === "Training allowed" ||
      (hasAllowedUse(allowedUses, "train") &&
        config.trainingStatus !== "Training restricted"),
  };
}

export function parseSelloContent(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const part of content.split("|")) {
    const [rawKey, ...valueParts] = part.split(":");
    const key = rawKey?.trim().toLowerCase();
    const value = valueParts.join(":").trim();
    if (!key || !value) continue;
    result[key] = value;
  }
  return result;
}

export function buildDemoSelloContent() {
  return [
    `id:${selloDemoArticle.id}`,
    `license:${selloCheckoutConfig.license.key}`,
    `author:${selloDemoArticle.author}`,
    `publisher:${selloDemoArticle.publisher.name}`,
    `pay:${selloCheckoutConfig.meta.pay}`,
    `onchain:${selloCheckoutConfig.meta.onchain}`,
    `price_usdc:${selloCheckoutConfig.narrationPrice.amountUSDC}`,
    `voice_id:${selloCheckoutConfig.meta.voiceId}`,
  ].join("|");
}

export function deriveAllowedUseMask(license: SelloLicenseKey | null): number {
  if (!license) return 0;
  if (license === selloCheckoutConfig.license.key) {
    return getAllowedUseMask([
      ...selloCheckoutConfig.freeUses,
      ...selloCheckoutConfig.paidUses,
    ]);
  }
  return LICENSE_CONFIG[license].allowedUses;
}

function normalizeLicense(value: string | undefined): SelloLicenseKey | null {
  if (!value) return null;
  if (value in LICENSE_CONFIG) {
    return value as SelloLicenseKey;
  }
  return null;
}
