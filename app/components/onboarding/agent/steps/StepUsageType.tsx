import type { UsageType } from "@/app/components/onboarding/agent/types";

const USAGE_OPTIONS: Array<{
  id: UsageType;
  title: string;
  description: string;
  caution?: string;
}> = [
  {
    id: "summarize",
    title: "Summarize articles",
    description: "Your AI can read an article and give a short summary.",
  },
  {
    id: "quote",
    title: "Use short quotes",
    description: "Your AI can copy small excerpts with proper credit.",
  },
  {
    id: "voice",
    title: "Read articles out loud",
    description: "Your AI can create an audio version when the creator allows it.",
    caution: "May require payment",
  },
  {
    id: "train",
    title: "Use for training",
    description: "Your AI can use the article to improve a model, only when allowed.",
    caution: "Often restricted",
  },
];

type StepUsageTypeProps = {
  value: UsageType[];
  onToggle: (usage: UsageType) => void;
  onContinue: () => void;
  onJump?: () => void;
};

export function StepUsageType({ value, onToggle, onContinue, onJump }: StepUsageTypeProps) {
  return (
    <div className="space-y-4">
      {USAGE_OPTIONS.map((option) => {
        const selected = value.includes(option.id);
        return (
          <label
            key={option.id}
            className={`postal-card block cursor-pointer p-4 transition ${
              selected ? "border-primary bg-primary/10" : "hover:border-primary/50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="font-headline text-lg sm:text-xl font-bold text-cream">
                  {option.title}
                </p>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">{option.description}</p>
                {option.caution ? (
                  <p className="mt-2 font-mono text-[9px] sm:text-xs uppercase tracking-[0.12em] text-gold">
                    {option.caution}
                  </p>
                ) : null}
              </div>
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggle(option.id)}
                className="mt-1 h-5 w-5 accent-primary shrink-0"
              />
            </div>
          </label>
        );
      })}

      <div className="border-l-2 border-primary bg-secondary p-4 font-mono text-[10px] sm:text-xs leading-5 text-muted italic">
        "Sello helps your AI check the creator&apos;s rules before it uses an article."
      </div>

      <div className="pt-6 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={onContinue}
          disabled={value.length === 0}
          className="stamp-button w-full group"
        >
          Begin Full Setup
          <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

        {onJump && (
          <button
            type="button"
            onClick={onJump}
            className="stamp-button-secondary w-full py-4 border-gold/40 text-gold hover:bg-gold/5 group"
          >
            <span className="mr-2">⚡</span>
            Skip to Live Demo
          </button>
        )}
      </div>
    </div>
  );
}
