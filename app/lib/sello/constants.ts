import { type Address } from "@solana/kit";

export const SELLO_POLICY_LINKS = {
  llms: "/llms.txt",
  tdmPolicy: "/tdm-policy.json",
  rsl: "/rsl.txt",
} as const;

export const SELLO_PAYMENT_STATE_LABELS = {
  idle: "Ready to check rights",
  detecting: "Checking rights",
  free: "Allowed now",
  blocked: "Blocked by policy",
  payable: "Payment required",
  paying: "Processing devnet payment",
  unlocking: "Unlocking narration",
  unlocked: "Narration unlocked",
  receiptPending: "Recording Solana receipt",
  receiptReady: "Receipt recorded",
  error: "Checkout failed",
} as const;

export type SelloPaymentStateKey = keyof typeof SELLO_PAYMENT_STATE_LABELS;

export const USES = {
  summarize: 1 << 0,
  quote: 1 << 1,
  voice: 1 << 2,
  train: 1 << 3,
} as const;

export type SelloUseKey = keyof typeof USES;
export type SelloLicenseKey =
  | "sello-free"
  | "sello-nc"
  | "sello-voice"
  | "sello-pay"
  | "sello-no-train";

export interface CreatorArticle {
  id: string;
  title: string;
  author: string;
  publisher: {
    name: string;
    walletAddress: string;
  };
  hash: string;
  contentPda: string;
  usageReceiptPda: string;
  license: SelloLicenseKey;
}

export interface SelloRevenueEvent {
  id: string;
  articleId: string;
  articleTitle: string;
  eventType: "rights_detected" | "payment_settled" | "receipt_recorded";
  amountUSDC: string;
  timestamp: string;
  receiptRef: string;
  actor: string;
  note: string;
}

export const selloDemoArticle: CreatorArticle = {
  id: "art-001",
  title: "The Agent Economy and the New Rights Signal",
  author: "Daniel Patete",
  publisher: {
    name: "Aval Newsrooms",
    walletAddress: "Y5GHe2xYz9ThBZsGN7VVJuSyjXNrkoGg1E2AJrNQYwN",
  },
  hash: "41f2b87bb2f4f4fe4a8a7b9f9d3d2a0c1b5e7d9a3f2c4e6d8b0a1c3e5f7a9b1",
  contentPda: "GW8vQ3sSZkCAVzRfp9xdG7N2UHjHBtNZKRcYwhQAJGbF",
  usageReceiptPda: "GjX2pM9wR4tL1zN5bS6vH7kQ3mY8cN4qR9tA2uW1xZ5",
  license: "sello-voice",
};

export const selloReceiptDemo = {
  receiptId: "GjX2pM9wR4tL1zN5bS6vH7kQ3mY8cN4qR9tA2uW1xZ5",
  articleTitle: selloDemoArticle.title,
  action: "voice_narration",
  settledAmountUSDC: "0.10",
  settledAt: "2026-05-09T17:42:11Z",
  cluster: "devnet",
  transactionSignature:
    "4r6L7vY2dN9qR5tM3kP8sH1xC6bJ4wF7uE2nA5zQ8mK1pR3sT6vY9dN2qR5tM8",
  usageReceiptPda: selloDemoArticle.usageReceiptPda,
  contentPda: selloDemoArticle.contentPda,
  payer: "AgentWalletDemo11111111111111111111111111111111",
  payee: selloDemoArticle.publisher.walletAddress,
  termsVersion: "v2026-05-demo",
  termsHash:
    "demo-terms-hash-41f2b87bb2f4f4fe4a8a7b9f9d3d2a0c1b5e7d9a3f2c4e6d8b0a1c3e5f7a9b1",
  proofNote:
    "Demo-safe receipt showing devnet payment state and Solana usage record, not legal ownership proof.",
} as const;

export const selloRevenueEvents = [
  {
    id: "rev-event-001",
    articleId: selloDemoArticle.id,
    articleTitle: selloDemoArticle.title,
    eventType: "rights_detected",
    amountUSDC: "0.00",
    timestamp: "2026-05-09T17:40:02Z",
    receiptRef: "pending",
    actor: "Agent checkout demo",
    note: "Agent detected Sello tag and policy files before narration request.",
  },
  {
    id: "rev-event-002",
    articleId: selloDemoArticle.id,
    articleTitle: selloDemoArticle.title,
    eventType: "payment_settled",
    amountUSDC: "0.10",
    timestamp: "2026-05-09T17:41:44Z",
    receiptRef: "tx:4r6L7vY2...",
    actor: "Agent checkout demo",
    note: "Devnet payment accepted for narration unlock.",
  },
  {
    id: "rev-event-003",
    articleId: selloDemoArticle.id,
    articleTitle: selloDemoArticle.title,
    eventType: "receipt_recorded",
    amountUSDC: "0.10",
    timestamp: "2026-05-09T17:42:11Z",
    receiptRef: selloReceiptDemo.receiptId,
    actor: "Aval Newsrooms Console",
    note: "Usage receipt linked to content hash and publisher wallet entity.",
  },
] as const satisfies ReadonlyArray<SelloRevenueEvent>;

export const LICENSE_LABELS: Record<SelloLicenseKey, string> = {
  "sello-free": "Sello Free",
  "sello-nc": "Sello Non-Commercial",
  "sello-voice": "Sello Voice Plus",
  "sello-pay": "Sello Pay-Per-Use",
  "sello-no-train": "Sello No-Train",
};

export const LICENSE_CONFIG: Record<
  SelloLicenseKey,
  {
    label: string;
    description: string;
    badge: string;
    licenseType: number;
    allowedUses: number;
    voiceStatus: string;
    trainingStatus: string;
    paymentStatus: string;
  }
> = {
  "sello-free": {
    label: LICENSE_LABELS["sello-free"],
    description: "All AI uses allowed with machine-readable attribution.",
    badge: "text-green-300 border-green-300/30 bg-green-300/10",
    licenseType: 0,
    allowedUses: USES.summarize | USES.quote | USES.voice | USES.train,
    voiceStatus: "All agents allowed",
    trainingStatus: "Model training allowed",
    paymentStatus: "No payment required",
  },
  "sello-nc": {
    label: LICENSE_LABELS["sello-nc"],
    description: "AI use allowed for non-commercial agents only.",
    badge: "text-blue-300 border-blue-300/30 bg-blue-300/10",
    licenseType: 1,
    allowedUses: USES.summarize | USES.quote | USES.voice,
    voiceStatus: "Non-commercial only",
    trainingStatus: "Commercial training blocked",
    paymentStatus: "Attribution only",
  },
  "sello-voice": {
    label: LICENSE_LABELS["sello-voice"],
    description: "Paid narration enabled via ElevenLabs integration.",
    badge: "text-primary border-primary/30 bg-primary/10",
    licenseType: 2,
    allowedUses: USES.summarize | USES.quote | USES.voice,
    voiceStatus: "Narration requires checkout",
    trainingStatus: "Training prohibited",
    paymentStatus: "0.10 USDC",
  },
  "sello-pay": {
    label: LICENSE_LABELS["sello-pay"],
    description: "AI use should be paid before action in devnet flow.",
    badge: "text-orange-300 border-orange-300/30 bg-orange-300/10",
    licenseType: 3,
    allowedUses: USES.summarize | USES.quote | USES.voice,
    voiceStatus: "Narration requires checkout",
    trainingStatus: "Training restricted",
    paymentStatus: "Custom price per action",
  },
  "sello-no-train": {
    label: LICENSE_LABELS["sello-no-train"],
    description:
      "Summaries and quotes allowed, training blocked by publisher terms.",
    badge: "text-red-300 border-red-300/30 bg-red-300/10",
    licenseType: 4,
    allowedUses: USES.summarize | USES.quote | USES.voice,
    voiceStatus: "Narration allowed",
    trainingStatus: "Training prohibited",
    paymentStatus: "Depends on publisher terms",
  },
};

export const LICENSE_MODES = LICENSE_CONFIG;

export const SELLO_NARRATIVE = {
  pitch: "Rights Checkout for AI Agents",
  loop: "Publish -> Detect -> Settle -> Audit",
  notaryMetaphor: "On-chain notary for machine-readable rules.",
} as const;

export interface SelloMetaFields {
  id: string;
  license: SelloLicenseKey;
  author: string;
  publisher: string;
  pay: string;
  onchain: string;
  priceUSDC: string;
  voiceId: string;
}

export interface SelloCheckoutConfig {
  license: {
    key: SelloLicenseKey;
    label: string;
    description: string;
    badge: string;
    licenseType: number;
  };
  freeUses: ReadonlyArray<SelloUseKey>;
  paidUses: ReadonlyArray<SelloUseKey>;
  narrationPrice: {
    units: bigint;
    amountUSDC: string;
    display: string;
  };
  trainingPolicy: {
    status: "allowed" | "prohibited" | "restricted";
    label: string;
  };
  attribution: {
    format: string;
    requirement: string;
  };
  policyLinks: typeof SELLO_POLICY_LINKS;
  paymentStates: typeof SELLO_PAYMENT_STATE_LABELS;
  meta: {
    pay: string;
    onchain: string;
    voiceId: string;
    priceUSDC: string;
    license: SelloLicenseKey;
  };
  receiptFields: ReadonlyArray<string>;
}

export const selloAgentPolicy = {
  attribution: {
    format: "According to {author} in {publisher}",
    requirement: "Include author and source platform in AI output.",
  },
};

export const selloCheckoutConfig: SelloCheckoutConfig = {
  license: {
    key: "sello-voice",
    label: LICENSE_LABELS["sello-voice"],
    description: LICENSE_CONFIG["sello-voice"].description,
    badge: LICENSE_CONFIG["sello-voice"].badge,
    licenseType: 2,
  },
  freeUses: ["summarize", "quote"],
  paidUses: ["voice"],
  narrationPrice: {
    units: 100000n,
    amountUSDC: "0.10",
    display: "0.10 USDC",
  },
  trainingPolicy: {
    status: "prohibited",
    label: "Training prohibited",
  },
  attribution: selloAgentPolicy.attribution,
  policyLinks: SELLO_POLICY_LINKS,
  paymentStates: SELLO_PAYMENT_STATE_LABELS,
  meta: {
    pay: "https://sello-protocol.vercel.app/api/narrate",
    onchain: selloDemoArticle.contentPda,
    voiceId: "cgSgqWJ1EBpqOT9IQncl",
    priceUSDC: "0.10",
    license: "sello-voice",
  },
  receiptFields: [
    "Usage type",
    "License",
    "Settled amount",
    "Publisher wallet",
    "Content hash",
    "ContentSello PDA",
    "UsageReceipt PDA",
    "Timestamp",
  ],
};

export const PROTOCOL_CHECKS = [
  { id: "tag", label: "Sello Meta Tag", detail: "Metadata found in <head>." },
  {
    id: "llms",
    label: "llms.txt signal",
    detail: "Human/AI hybrid policy active.",
  },
  {
    id: "tdm",
    label: "TDM Reservation",
    detail: "JSON-LD rights reservation found.",
  },
  {
    id: "onchain",
    label: "Solana Proof",
    detail: "ContentSello record found on-chain.",
  },
];
