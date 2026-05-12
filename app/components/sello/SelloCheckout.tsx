import {
  getPaymentStateLabel,
  selloCheckoutConfig,
  selloDemoArticle,
  type SelloLicenseKey,
  type SelloPaymentStateKey,
  type SelloUseKey,
} from "@/app/lib/sello/checkout-model";
import {
  AgentRequestTimeline,
  type AgentTimelineStepKey,
} from "./AgentRequestTimeline";
import { ProofOfConsentReceipt } from "./ProofOfConsentReceipt";

export type SelloUnlockState = "locked" | "unlocking" | "unlocked" | "error";
export type SelloReceiptState =
  | "not_started"
  | "recording"
  | "recorded"
  | "demo"
  | "error";

export type SelloCheckoutProps = {
  requestedAction?: SelloUseKey | string;
  license?: SelloLicenseKey;
  priceUSDC?: string;
  paymentState?: SelloPaymentStateKey;
  unlockState?: SelloUnlockState;
  receiptState?: SelloReceiptState;
  currentStep?: AgentTimelineStepKey;
  articleTitle?: string;
  showReceipt?: boolean;
  onStepClick?: (step: AgentTimelineStepKey) => void;
  className?: string;
};

function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "good" | "warn";
}) {
  const toneClass =
    tone === "good"
      ? "border-green-ink/30 bg-green-ink/5 text-green-ink"
      : tone === "warn"
        ? "border-gold/30 bg-gold/5 text-gold"
        : "border-border-low bg-background/40 text-muted";

  return (
    <span
      className={`stamp-badge text-xs uppercase font-bold tracking-tighter ${toneClass}`}
    >
      {label}
    </span>
  );
}

function DetailCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        {label}
      </p>
      <p className="mt-1 break-words font-headline text-lg font-black uppercase text-cream">
        {value}
      </p>
      {note ? (
        <p className="mt-1 text-xs leading-relaxed text-muted italic">{note}</p>
      ) : null}
    </div>
  );
}

function unlockLabel(state: SelloUnlockState) {
  switch (state) {
    case "unlocking":
      return "Unlocking asset";
    case "unlocked":
      return "Asset ready";
    case "error":
      return "Unlock failed";
    default:
      return "Locked: Clear checkout";
  }
}

function receiptLabel(state: SelloReceiptState) {
  switch (state) {
    case "recording":
      return "Recording receipt";
    case "recorded":
      return "Receipt recorded";
    case "demo":
      return "Demo receipt";
    case "error":
      return "Receipt failed";
    default:
      return "Receipt pending";
  }
}

export function SelloCheckout({
  requestedAction = "Voice narration",
  priceUSDC = "0.10",
  paymentState = "payable",
  unlockState = "locked",
  receiptState = "not_started",
  currentStep = "pay",
  showReceipt = true,
  onStepClick,
  className = "",
}: SelloCheckoutProps) {
  const paymentLabel = getPaymentStateLabel(paymentState);

  const paymentTone =
    paymentState === "unlocked" || paymentState === "receiptReady"
      ? "good"
      : "warn";
  const unlockTone =
    unlockState === "unlocked"
      ? "good"
      : unlockState === "error"
        ? "warn"
        : "neutral";
  const receiptTone =
    receiptState === "recorded" || receiptState === "demo"
      ? "good"
      : receiptState === "error"
        ? "warn"
        : "neutral";

  return (
    <section className={`min-w-0 space-y-4 ${className}`}>
      <div className="postal-card w-full overflow-hidden border-border-low bg-card/20 shadow-lg">
        {/* Header */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="stamp-badge text-xs text-gold font-bold italic">
              Rights Checkout
            </span>
            <span className="text-xs font-mono text-muted uppercase">
              x402-style devnet payment
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DetailCard label="Target action" value={String(requestedAction)} />
            <DetailCard
              label="Micropayment"
              value={`${priceUSDC} USDC`}
              note="Devnet amount"
            />
          </div>
        </div>

        {/* Timeline */}
        <AgentRequestTimeline
          currentStep={currentStep}
          onStepClick={onStepClick}
        />

        {/* Footer States */}
        <div className="grid grid-cols-1 gap-px bg-border-low sm:grid-cols-3">
          <div className="bg-background/40 p-4">
            <StatusPill label={paymentLabel} tone={paymentTone} />
          </div>
          <div className="bg-background/40 p-4">
            <StatusPill label={unlockLabel(unlockState)} tone={unlockTone} />
          </div>
          <div className="bg-background/40 p-4">
            <StatusPill label={receiptLabel(receiptState)} tone={receiptTone} />
          </div>
        </div>
      </div>

      {showReceipt && (
        <ProofOfConsentReceipt
          articleTitle={selloDemoArticle.title}
          license={selloCheckoutConfig.license.key}
          paymentAmountUSDC={priceUSDC}
        />
      )}
    </section>
  );
}
