import { AnchorProvider, type Idl, Program } from "@coral-xyz/anchor";
import type { Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { SELLO_PROGRAM_ID_STRING } from "./constants";

export type AnchorWalletLike = {
  publicKey: PublicKey;
  signTransaction: <T extends Transaction | VersionedTransaction>(transaction: T) => Promise<T>;
  signAllTransactions: <T extends Transaction | VersionedTransaction>(transactions: T[]) => Promise<T[]>;
};

export function hasAnchorWallet(wallet: WalletContextState): wallet is WalletContextState & AnchorWalletLike {
  return Boolean(wallet.publicKey && wallet.signTransaction && wallet.signAllTransactions);
}

export function createAnchorProvider(
  connection: Connection,
  wallet: AnchorWalletLike,
) {
  return new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
}

export function createAnchorProgram<T extends Idl>(
  idl: T,
  connection: Connection,
  wallet: AnchorWalletLike,
  programId = SELLO_PROGRAM_ID_STRING,
) {
  const provider = createAnchorProvider(connection, wallet);
  const idlWithAddress = { ...idl, address: programId } as T & { address: string };
  return new Program(idlWithAddress, provider);
}
