import { clusterApiUrl, PublicKey } from "@solana/web3.js";

export const SELLO_PROGRAM_ID_STRING =
  process.env.NEXT_PUBLIC_PROGRAM_ID ??
  "HhXvRpC6uDfCF6sHNWv3xD2yzyjpiEW17eeK13tFaycC";

export const SELLO_PROGRAM_ID = new PublicKey(SELLO_PROGRAM_ID_STRING);
export const SOLANA_CLUSTER = "devnet";
export const SOLANA_RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl(SOLANA_CLUSTER);
export const USDC_MICROS_PER_USDC = 1_000_000;

export function buildExplorerUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `https://explorer.solana.com${normalized}?cluster=${SOLANA_CLUSTER}`;
}
