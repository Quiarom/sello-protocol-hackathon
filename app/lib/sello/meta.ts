import { DEMO_ARTICLE } from "./constants";

export type SelloMeta = {
  id: string;
  license: string;
  author: string;
  publisher: string;
  pay: string;
  onchain: string;
  priceUSDC: string;
};

export function buildSelloMeta(options?: {
  payEndpoint?: string;
  license?: string;
  contentPda?: string;
  priceUSDC?: string;
}) {
  const payEndpoint = options?.payEndpoint ?? "/api/narrate";
  const license = options?.license ?? DEMO_ARTICLE.license;
  const contentPda = options?.contentPda ?? DEMO_ARTICLE.contentPda;
  const priceUSDC = options?.priceUSDC ?? DEMO_ARTICLE.priceUSDC;

  return [
    `id:${DEMO_ARTICLE.id}`,
    `license:${license}`,
    `author:${DEMO_ARTICLE.author}`,
    `publisher:${DEMO_ARTICLE.publisher}`,
    `pay:${payEndpoint}`,
    `onchain:solana:devnet:${contentPda}`,
    `price_usdc:${priceUSDC}`,
  ].join("|");
}

export function parseSelloMeta(html: string): SelloMeta | null {
  const tag = html.match(/<meta\s+[^>]*name=["']sello["'][^>]*>/i)?.[0];
  const content = tag?.match(/content=["']([^"']+)["']/i)?.[1];
  if (!content) return null;

  const fields = Object.fromEntries(
    content.split("|").map((part) => {
      const [key, ...rest] = part.split(":");
      return [key.trim(), rest.join(":").trim()];
    }),
  );

  return {
    id: fields.id ?? "",
    license: fields.license ?? "",
    author: fields.author ?? "",
    publisher: fields.publisher ?? "",
    pay: fields.pay ?? "",
    onchain: fields.onchain ?? "",
    priceUSDC: fields.price_usdc ?? "0",
  };
}
