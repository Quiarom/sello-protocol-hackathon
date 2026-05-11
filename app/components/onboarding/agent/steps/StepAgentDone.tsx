type StepAgentDoneProps = {
  walletAddress: string | null;
};

export function StepAgentDone({ walletAddress }: StepAgentDoneProps) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-5 text-center md:px-8">
      <div className="postal-card w-full p-8 md:p-12">
        <div className="postmark mx-auto flex h-28 w-28 rotate-[-12deg] items-center justify-center text-[10px]">
          Approved<br />Agent
        </div>
        <h1 className="font-headline mt-6 text-4xl font-black uppercase tracking-tight text-cream md:text-6xl">
          Your AI is ready
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
          It can now check article rules before it summarizes, quotes, or narrates.
        </p>
        <div className="mt-5 break-all border border-border-low bg-background px-4 py-3 text-xs text-muted">
          Payment wallet:{" "}
          <span className="font-mono text-foreground">{walletAddress ?? "not set"}</span>
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a href="/dashboard?view=agent" className="stamp-button">
            Go to dashboard
          </a>
          <a
            href={`https://explorer.solana.com/address/${walletAddress}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
            className="stamp-button stamp-button-secondary"
          >
            View Wallet on Explorer
          </a>
        </div>
      </div>
    </div>
  );
}
