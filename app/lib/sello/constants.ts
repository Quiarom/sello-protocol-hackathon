export const DEMO_ARTICLE = {
  id: "asilo-demo-001",
  slug: "protected-article",
  title: "How AI agents should request consent before using articles",
  subtitle:
    "A Proof of Consent demo for Aval Newsrooms: public rules for AI use, visible to agents, anchored to Solana devnet.",
  author: "Daniel Patete",
  publisher: "Aval Newsrooms / Asilo Digital",
  canonicalPath: "/blog/protected-article",
  license: "sello-voice",
  priceUSDC: "0.10",
  contentPda: "DEMO_CONTENT_SELLO_PDA_REPLACE_AFTER_REGISTRATION",
  programId: "HhXvRpC6uDfCF6sHNWv3xD2yzyjpiEW17eeK13tFaycC",
  usageReceipt: "DEMO_USAGE_RECEIPT_AFTER_LICENSED_USE",
  attribution: "Según Daniel Patete en Aval Newsrooms / Asilo Digital",
  summaryPermission: "Allowed with attribution",
  trainingRestriction: "Training prohibited without a separate license",
  voiceCondition: "Voice narration requires licensed consent and a usage receipt",
  devnetRecord:
    "Demo placeholder until a connected wallet submits register_content_sello on Solana devnet.",
  hashSource: [
    "Aval Newsrooms demo article",
    "How AI agents should request consent before using articles",
    "Creators publish the rules. Agents can read them. Solana keeps the proof.",
    "Sello is not a paywall. It is a public notary for AI-native licensing.",
  ].join("\n"),
} as const;

export const USES = {
  summarize: 1 << 0,
  quote: 1 << 1,
  voice: 1 << 2,
  train: 1 << 3,
} as const;

export const LICENSE_LABELS: Record<string, string> = {
  "sello-free": "Sello Free — any use with attribution",
  "sello-nc": "Sello NC — non-commercial free, commercial paid",
  "sello-voice": "Sello Voice — read free, narration licensed",
  "sello-pay": "Sello Pay — all AI use requires payment",
  "sello-no-train": "Sello No Train — use allowed, training restricted",
};

export const LICENSE_CONFIG: Record<
  string,
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
    description: "Attribution required. No payment gate in the demo flow.",
    badge: "text-green-ink border-green-ink/30 bg-green-ink/10",
    licenseType: 0,
    allowedUses: USES.summarize | USES.quote | USES.voice | USES.train,
    voiceStatus: "Narration allowed",
    trainingStatus: "Training allowed",
    paymentStatus: "Free",
  },
  "sello-nc": {
    label: LICENSE_LABELS["sello-nc"],
    description: "Commercial use should trigger payment logic outside this hackathon build.",
    badge: "text-gold border-gold/30 bg-gold/10",
    licenseType: 1,
    allowedUses: USES.summarize | USES.quote | USES.voice,
    voiceStatus: "Narration allowed when terms are respected",
    trainingStatus: "Training restricted",
    paymentStatus: "Conditional payment",
  },
  "sello-voice": {
    label: LICENSE_LABELS["sello-voice"],
    description: "Preferred demo path: summary allowed, narration requires licensed flow.",
    badge: "text-primary border-primary/30 bg-primary/10",
    licenseType: 2,
    allowedUses: USES.summarize | USES.quote | USES.voice,
    voiceStatus: "Licensed narration required",
    trainingStatus: "Training restricted",
    paymentStatus: "0.10 USDC demo",
  },
  "sello-pay": {
    label: LICENSE_LABELS["sello-pay"],
    description: "All AI use should be paid before use. Payment UI remains demo-level.",
    badge: "text-orange-300 border-orange-300/30 bg-orange-300/10",
    licenseType: 3,
    allowedUses: USES.summarize | USES.quote | USES.voice,
    voiceStatus: "Licensed narration required",
    trainingStatus: "Training restricted",
    paymentStatus: "Paid before use",
  },
  "sello-no-train": {
    label: LICENSE_LABELS["sello-no-train"],
    description: "Summaries and quotations allowed, but model training is disallowed.",
    badge: "text-red-300 border-red-300/30 bg-red-300/10",
    licenseType: 4,
    allowedUses: USES.summarize | USES.quote | USES.voice,
    voiceStatus: "Narration allowed",
    trainingStatus: "Training prohibited",
    paymentStatus: "Depends on publisher terms",
  },
};
