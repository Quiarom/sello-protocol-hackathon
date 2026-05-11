import { PublicKey } from "@solana/web3.js";
import { SELLO_PROGRAM_ID } from "./constants";

export const PDA_SEEDS = {
  contentSello: ["sello", "author", "content_hash"],
  voiceConsent: ["voice", "author"],
  usageReceipt: ["receipt", "sello", "payer", "timestamp_le_bytes"],
} as const;

export function deriveContentSelloPda(author: PublicKey, contentHash: Uint8Array) {
  return PublicKey.findProgramAddressSync(
    [new TextEncoder().encode("sello"), author.toBytes(), contentHash],
    SELLO_PROGRAM_ID,
  );
}

export function deriveVoiceConsentPda(author: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [new TextEncoder().encode("voice"), author.toBytes()],
    SELLO_PROGRAM_ID,
  );
}

export function deriveUsageReceiptPda(
  sello: PublicKey,
  payer: PublicKey,
  timestamp: bigint,
) {
  const tsBuffer = new Uint8Array(8);
  new DataView(tsBuffer.buffer).setBigInt64(0, timestamp, true);
  return PublicKey.findProgramAddressSync(
    [new TextEncoder().encode("receipt"), sello.toBytes(), payer.toBytes(), tsBuffer],
    SELLO_PROGRAM_ID,
  );
}
