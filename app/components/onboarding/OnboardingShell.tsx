import type { ReactNode } from "react";

type OnboardingShellProps = {
  title: string;
  description: string;
  step: number;
  totalSteps: number;
  children: ReactNode;
};

export function OnboardingShell({
  title,
  description,
  step,
  totalSteps,
  children,
}: OnboardingShellProps) {
  const progress = Math.min(100, Math.round((step / totalSteps) * 100));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-8 md:py-14">
      <div className="postal-card p-4 sm:p-6 md:p-8">
        <div className="airmail-stripe mb-5 md:h-2" />
        <div className="mb-6 md:mb-8">
          <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.22em] text-primary">
            Step {step} of {totalSteps}
          </p>
          <div className="mt-3 h-1.5 sm:h-2 w-full border border-border-low bg-background">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <h1 className="font-headline mt-4 sm:mt-6 text-2xl sm:text-3xl md:text-5xl font-black uppercase leading-tight text-cream">
            {title}
          </h1>
          <p className="mt-2 sm:mt-3 max-w-2xl text-sm sm:text-base text-muted">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
