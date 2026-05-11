"use client";

import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  {
    ssr: false,
    loading: () => (
      <button className="stamp-button px-5 py-3 text-base" type="button">
        Connect Wallet
      </button>
    ),
  },
);

export function ConnectWalletButton() {
  return <WalletMultiButton className="stamp-button px-5 py-3 text-base" />;
}
