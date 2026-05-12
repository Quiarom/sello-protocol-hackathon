"use client";

import { useReducer } from "react";
import { OnboardingShell } from "@/app/components/onboarding/OnboardingShell";
import {
  INITIAL_AGENT_ONBOARDING_STATE,
  type AgentOnboardingState,
  type AgentPlatform,
  type PaymentConfig,
  type TestResult,
  type UsageType,
} from "@/app/components/onboarding/agent/types";
import { StepUsageType } from "@/app/components/onboarding/agent/steps/StepUsageType";
import { StepPlatform } from "@/app/components/onboarding/agent/steps/StepPlatform";
import { StepInstallSkill } from "@/app/components/onboarding/agent/steps/StepInstallSkill";
import { StepAgentWallet } from "@/app/components/onboarding/agent/steps/StepAgentWallet";
import { StepTestURL } from "@/app/components/onboarding/agent/steps/StepTestURL";
import { StepAgentDone } from "@/app/components/onboarding/agent/steps/StepAgentDone";

type Action =
  | { type: "next-step" }
  | { type: "toggle-usage"; usage: UsageType }
  | { type: "set-platform"; platform: AgentPlatform }
  | { type: "set-skill-installed"; value: boolean }
  | { type: "set-wallet"; wallet: string }
  | { type: "set-payment-config"; paymentConfig: PaymentConfig }
  | { type: "set-test-url"; url: string }
  | { type: "set-test-loading"; loading: boolean }
  | { type: "set-test-result"; result: TestResult | null }
  | { type: "set-test-error"; error: string | null };

function reducer(
  state: AgentOnboardingState,
  action: Action
): AgentOnboardingState {
  switch (action.type) {
    case "next-step":
      return { ...state, step: Math.min(6, state.step + 1) };
    case "toggle-usage": {
      const exists = state.usageTypes.includes(action.usage);
      return {
        ...state,
        usageTypes: exists
          ? state.usageTypes.filter((item) => item !== action.usage)
          : [...state.usageTypes, action.usage],
      };
    }
    case "set-platform":
      return { ...state, platform: action.platform };
    case "set-skill-installed":
      return { ...state, skillInstalled: action.value };
    case "set-wallet":
      return { ...state, agentWalletAddress: action.wallet };
    case "set-payment-config":
      return { ...state, paymentConfig: action.paymentConfig };
    case "set-test-url":
      return { ...state, testURL: action.url };
    case "set-test-loading":
      return { ...state, testLoading: action.loading };
    case "set-test-result":
      return { ...state, testResult: action.result };
    case "set-test-error":
      return { ...state, testError: action.error };
    default:
      return state;
  }
}

const STEP_META: Record<number, { title: string; description: string }> = {
  1: {
    title: "Intended Use",
    description:
      "Define how your AI agent will interact with the machine-readable rules published by creators.",
  },
  2: {
    title: "Agent Wallet & Budget",
    description:
      "Initialize your agent with a wallet and automated settlement boundaries for paid actions.",
  },
  3: {
    title: "Live Rights Checkout",
    description:
      "The agent detects Sello rules, pays when required, and records proof of permitted use.",
  },
  4: {
    title: "Automated Compliance",
    description:
      "Install the Sello Skill to automate the detection and settlement loop in your own agent.",
  },
};

export function AgentOnboarding() {
  const [state, dispatch] = useReducer(reducer, INITIAL_AGENT_ONBOARDING_STATE);

  const jumpToCheckout = () => {
    // Jump straight to step 3
    dispatch({ type: "next-step" }); // to step 2
    dispatch({ type: "next-step" }); // to step 3
  };

  const analyzeLicense = async () => {
    if (!state.testURL) return null;
    dispatch({ type: "set-test-loading", loading: true });
    dispatch({ type: "set-test-error", error: null });
    try {
      const response = await fetch(
        `/api/license?url=${encodeURIComponent(state.testURL)}`,
        {
          method: "GET",
        }
      );
      const body = (await response.json()) as TestResult & { error?: string };
      if (!response.ok) {
        throw new Error(body.error ?? "License lookup failed.");
      }
      dispatch({ type: "set-test-result", result: body });
      return body;
    } catch (error) {
      dispatch({
        type: "set-test-error",
        error:
          error instanceof Error
            ? error.message
            : "Unknown license lookup error.",
      });
      return null;
    } finally {
      dispatch({ type: "set-test-loading", loading: false });
    }
  };

  if (state.step === 5) {
    return <StepAgentDone walletAddress={state.agentWalletAddress} />;
  }

  const stepMeta = STEP_META[state.step];

  return (
    <OnboardingShell
      title={stepMeta.title}
      description={stepMeta.description}
      step={state.step}
      totalSteps={4}
    >
      {state.step === 1 ? (
        <StepUsageType
          value={state.usageTypes}
          onToggle={(usage) => dispatch({ type: "toggle-usage", usage })}
          onContinue={() => dispatch({ type: "next-step" })}
          onJump={jumpToCheckout}
        />
      ) : null}

      {state.step === 2 ? (
        <StepAgentWallet
          agentWalletAddress={state.agentWalletAddress}
          paymentConfig={state.paymentConfig}
          onWalletChange={(wallet) => dispatch({ type: "set-wallet", wallet })}
          onPaymentConfigChange={(paymentConfig) =>
            dispatch({ type: "set-payment-config", paymentConfig })
          }
          onContinue={() => dispatch({ type: "next-step" })}
        />
      ) : null}

      {state.step === 3 ? (
        <StepTestURL
          testURL={state.testURL}
          testResult={state.testResult}
          testLoading={state.testLoading}
          testError={state.testError}
          onUrlChange={(url) => dispatch({ type: "set-test-url", url })}
          onAnalyze={analyzeLicense}
          onContinue={() => dispatch({ type: "next-step" })}
        />
      ) : null}

      {state.step === 4 ? (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <section className="postal-card flex flex-col gap-4 border-primary/20 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="space-y-1">
              <p className="font-display text-xl uppercase tracking-[0.14em] text-primary">
                Agent Skills
              </p>
              <p className="max-w-xl text-xs text-muted sm:text-sm">
                Skip this setup during the demo and go straight to the ready
                state.
              </p>
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: "next-step" })}
              className="stamp-button stamp-button-secondary w-full py-3 sm:w-auto"
            >
              Skip to Ready
            </button>
          </section>
          <StepPlatform
            value={state.platform}
            onChange={(platform) =>
              dispatch({ type: "set-platform", platform })
            }
            onContinue={() => {}}
          />
          {state.platform && (
            <StepInstallSkill
              platform={state.platform}
              agentWalletAddress={state.agentWalletAddress}
              maxAutoPayPerTx={state.paymentConfig.maxAutoPayPerTx}
              skillInstalled={state.skillInstalled}
              onSkillInstalledChange={(value) =>
                dispatch({ type: "set-skill-installed", value })
              }
              onContinue={() => dispatch({ type: "next-step" })}
            />
          )}
        </div>
      ) : null}
    </OnboardingShell>
  );
}
