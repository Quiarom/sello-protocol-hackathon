export type UsageType = "summarize" | "quote" | "voice" | "train";

export type AgentPlatform =
  | "claude-code"
  | "gemini-cli"
  | "codex"
  | "openai-agents-sdk"
  | "custom";

export interface PaymentConfig {
  autoPayEnabled: boolean;
  maxAutoPayPerTx: number;
  maxAutoPayPerDay: number;
  autoTopUpEnabled: boolean;
  autoTopUpThreshold: number;
  autoTopUpAmount: number;
}

export interface CreatorProfile {
  contactEmail: string | null;
  publicProfileUrl: string | null;
  domain: string;
  totalArticles: number;
}

export interface TestResult {
  url: string;
  hasSello: boolean;
  license: string | null;
  selloId: string | null;
  author: string;
  publisher: string;
  permissions: {
    canSummarize: boolean;
    canQuote: boolean;
    canVoice: boolean | "paid";
    canTrain: boolean;
  };
  priceUSDC: number;
  attribution: string;
  contentSelloPDA: string | null;
  onchainVerified?: boolean;
  onchainRevoked?: boolean;
  payEndpoint: string;
  creatorProfile: CreatorProfile | null;
  hasLlmsTxt: boolean;
  hasTdmPolicy: boolean;
  complianceScore: number;
}

export interface AgentOnboardingState {
  step: number;
  usageTypes: UsageType[];
  platform: AgentPlatform | null;
  skillInstalled: boolean;
  agentWalletAddress: string | null;
  paymentConfig: PaymentConfig;
  testURL: string;
  testResult: TestResult | null;
  testLoading: boolean;
  testError: string | null;
  agentConfigId: string | null;
}

export const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  autoPayEnabled: false,
  maxAutoPayPerTx: 0.5,
  maxAutoPayPerDay: 5,
  autoTopUpEnabled: false,
  autoTopUpThreshold: 1,
  autoTopUpAmount: 5,
};

export const INITIAL_AGENT_ONBOARDING_STATE: AgentOnboardingState = {
  step: 1,
  usageTypes: [],
  platform: null,
  skillInstalled: false,
  agentWalletAddress: null,
  paymentConfig: DEFAULT_PAYMENT_CONFIG,
  testURL: "",
  testResult: null,
  testLoading: false,
  testError: null,
  agentConfigId: null,
};
