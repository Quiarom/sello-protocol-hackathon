export type ParsedSelloTag = {
  id: string | null;
  license: string | null;
  author: string;
  publisher: string;
  payEndpoint: string;
  onchain: string | null;
  priceUSDC: number;
};

export function parseSelloMeta(html: string): ParsedSelloTag | null {
  // Ultra-lenient search for the sello meta tag
  const metaTags = html.match(/<meta\s+[^>]+>/gi);
  if (!metaTags) return null;

  const selloTag = metaTags.find(tag => {
    const nameMatch = tag.match(/name=["']sello["']/i);
    return !!nameMatch;
  });

  if (!selloTag) {
    // Last ditch: check if 'sello' is in any attribute value
    const lastDitch = metaTags.find(tag => tag.toLowerCase().includes('sello'));
    if (lastDitch) return extractFromTag(lastDitch);
    return null;
  }

  return extractFromTag(selloTag);
}

function extractFromTag(tag: string): ParsedSelloTag | null {
  const contentMatch = tag.match(/content=["']([^"']+)["']/i);
  if (!contentMatch) {
    return null;
  }

  const fields = parseSelloContent(contentMatch[1]);
  const parsedPrice = Number(fields.price_usdc ?? "0");
  return {
    id: fields.id ?? null,
    license: fields.license ?? null,
    author: fields.author ?? "Unknown author",
    publisher: fields.publisher ?? "Unknown publisher",
    payEndpoint: fields.pay ?? "",
    onchain: fields.onchain ?? null,
    priceUSDC: Number.isFinite(parsedPrice) ? parsedPrice : 0,
  };
}

export function derivePermissions(license: string | null): {
  canSummarize: boolean;
  canQuote: boolean;
  canVoice: boolean | "paid";
  canTrain: boolean;
} {
  switch (license) {
    case "sello-free":
      return {
        canSummarize: true,
        canQuote: true,
        canVoice: true,
        canTrain: true,
      };
    case "sello-nc":
      return {
        canSummarize: true,
        canQuote: true,
        canVoice: true,
        canTrain: true,
      };
    case "sello-voice":
      return {
        canSummarize: true,
        canQuote: true,
        canVoice: "paid",
        canTrain: false,
      };
    case "sello-pay":
      return {
        canSummarize: true,
        canQuote: true,
        canVoice: "paid",
        canTrain: false,
      };
    case "sello-no-train":
      return {
        canSummarize: true,
        canQuote: true,
        canVoice: true,
        canTrain: false,
      };
    default:
      return {
        canSummarize: false,
        canQuote: false,
        canVoice: false,
        canTrain: false,
      };
  }
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
