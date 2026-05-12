import logo from "@/app/assets/logo.jpg";
import Image from "next/image";

type StepAgentDoneProps = {
  walletAddress: string | null;
};

export function StepAgentDone({ walletAddress }: StepAgentDoneProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-72px)] w-full max-w-7xl flex-col items-center justify-center border-x border-border-low bg-background/20 px-5 text-center md:px-8">
      <div className="postal-card max-w-2xl w-full p-10 md:p-16 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] border-primary/30">
        <div className="relative mx-auto h-32 w-32 animate-in zoom-in duration-1000">
          <div className="postmark absolute inset-0 flex h-full w-full rotate-[-12deg] items-center justify-center text-xs opacity-40">
            APPROVED
            <br />
            AGENT
          </div>
          <Image
            src={logo}
            alt="Sello Protocol"
            width={128}
            height={128}
            className="stamp-image h-full w-full object-cover shadow-2xl grayscale brightness-125 sepia-[0.3]"
          />
        </div>
        <h1 className="font-headline mt-10 text-5xl font-black uppercase tracking-tight text-cream md:text-7xl">
          Agent Ready
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted leading-relaxed">
          Your agent is now equipped to navigate the Sello Protocol. It can
          detect rules, negotiate terms, and execute x402-style settlements.
        </p>
        <div className="mt-8 break-all border border-border-low bg-background/50 px-6 py-4 text-sm text-muted">
          <span className="font-mono uppercase text-xs tracking-widest block mb-1 opacity-50">
            Solana devnet UsageReceipt authority
          </span>
          <span className="font-mono text-primary font-bold">
            {walletAddress ?? "not set"}
          </span>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a href="/dashboard?view=agent" className="stamp-button px-10 py-4">
            Go to dashboard
          </a>
          <a
            href={`https://explorer.solana.com/address/${walletAddress}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
            className="stamp-button stamp-button-secondary px-10 py-4"
          >
            View Wallet on Explorer
          </a>
        </div>
      </div>
    </div>
  );
}
