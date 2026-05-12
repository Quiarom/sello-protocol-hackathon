"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type PropsWithChildren,
} from "react";
import type { TransactionSigner } from "@solana/kit";
import type { WalletConnector, WalletSession } from "./types";
import { discoverWallets, watchWallets } from "./standard";
import { createWalletSigner } from "./signer";
import { useCluster } from "../../components/cluster-context";

const WALLET_STATUS = {
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  ERROR: "error",
} as const;

type WalletStatus = (typeof WALLET_STATUS)[keyof typeof WALLET_STATUS];

type WalletContextValue = {
  connectors: WalletConnector[];
  status: WalletStatus;
  wallet: WalletSession | undefined;
  signer: TransactionSigner | undefined;
  error: unknown;
  connect: (connectorId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  isReady: boolean;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: PropsWithChildren) {
  const { cluster } = useCluster();
  const chain = `solana:${cluster}`;

  const [connectors, setConnectors] = useState<WalletConnector[]>([]);
  const [session, setSession] = useState<WalletSession | undefined>();
  const [status, setStatus] = useState<WalletStatus>(
    WALLET_STATUS.DISCONNECTED
  );
  const [error, setError] = useState<unknown>();
  const [mounted, setMounted] = useState(false);

  const connectorsRef = useRef<WalletConnector[]>([]);

  useEffect(() => {
    setMounted(true);
    const initialConnectors = discoverWallets();
    setConnectors(initialConnectors);
    connectorsRef.current = initialConnectors;

    const unsubscribe = watchWallets((updated) => {
      connectorsRef.current = updated;
      setConnectors(updated);
    });
    return unsubscribe;
  }, []);

  const connect = useCallback(async (connectorId: string) => {
    const connector = connectorsRef.current.find((c) => c.id === connectorId);
    if (!connector) throw new Error(`Unknown connector: ${connectorId}`);

    setStatus(WALLET_STATUS.CONNECTING);
    setError(undefined);

    try {
      const s = await connector.connect();
      setSession(s);
      setStatus(WALLET_STATUS.CONNECTED);
    } catch (err) {
      setError(err);
      setStatus(WALLET_STATUS.ERROR);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (session) {
      try {
        await session.disconnect();
      } catch {
        /* ignore disconnect errors */
      }
    }
    setSession(undefined);
    setStatus(WALLET_STATUS.DISCONNECTED);
    setError(undefined);
  }, [session]);

  const signer = useMemo(
    () => (session ? createWalletSigner(session, chain) : undefined),
    [session, chain]
  );

  const value = useMemo<WalletContextValue>(
    () => ({
      connectors,
      status,
      wallet: session,
      signer,
      error,
      connect,
      disconnect,
      isReady: mounted,
    }),
    [connectors, status, session, signer, error, connect, disconnect, mounted]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
