import type { AgentPlatform } from "@/app/components/onboarding/agent/types";

const PLATFORM_OPTIONS: Array<{
  id: AgentPlatform;
  name: string;
  description: string;
  installPath: string;
}> = [
  {
    id: "claude-code",
    name: "Claude Code",
    description: "Use Sello inside your local Claude Code workflow.",
    installPath: ".claude/skills/sello-content-license/SKILL.md",
  },
  {
    id: "gemini-cli",
    name: "Gemini CLI",
    description: "Use Sello from Gemini in your terminal.",
    installPath: ".gemini/skills/sello-content-license.md",
  },
  {
    id: "codex",
    name: "GitHub Copilot / Codex",
    description: "Add Sello instructions to your coding assistant.",
    installPath: ".github/copilot-instructions.md",
  },
  {
    id: "openai-agents-sdk",
    name: "OpenAI Agents SDK",
    description: "Add Sello behavior to your custom agent.",
    installPath: "system_prompt",
  },
  {
    id: "custom",
    name: "Custom agent API",
    description: "Use Sello with your own AI workflow.",
    installPath: "system_prompt",
  },
];

type StepPlatformProps = {
  value: AgentPlatform | null;
  onChange: (platform: AgentPlatform) => void;
  onContinue: () => void;
};

export function StepPlatform({ value, onChange, onContinue }: StepPlatformProps) {
  return (
    <div className="space-y-3">
      {PLATFORM_OPTIONS.map((platform) => (
        <label
          key={platform.id}
          className={`postal-card block cursor-pointer p-4 transition ${
            value === platform.id ? "border-primary bg-primary/10" : "hover:border-primary/50"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="font-headline text-lg sm:text-xl font-bold text-cream">
                {platform.name}
              </p>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">{platform.description}</p>
              <code className="mt-3 block border border-border-low bg-background/50 px-2 py-1.5 text-[9px] sm:text-xs text-muted truncate max-w-[200px] sm:max-w-none">
                {platform.installPath}
              </code>
            </div>
            <input
              type="radio"
              name="agent-platform"
              checked={value === platform.id}
              onChange={() => onChange(platform.id)}
              className="mt-1 h-5 w-5 accent-primary shrink-0"
            />
          </div>
        </label>
      ))}

      <button
        type="button"
        onClick={onContinue}
        disabled={!value}
        className="stamp-button mt-4 w-full sm:w-auto group"
      >
        Continue
        <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );
}
