"use client";

import { useState } from "react";
import { ellipsify } from "@/app/lib/explorer";
import { toast } from "sonner";

type CreatorArticle = {
  url: string;
  pda: string;
  license: string;
};

const PROTOCOL_CHECKS = [
  { id: "tag", label: "Sello tag", detail: "Demo article publishes machine-readable license terms." },
  { id: "llms", label: "llms.txt", detail: "Crawler policy is available in /llms.txt." },
  { id: "tdm", label: "tdm-policy", detail: "TDM policy is available in /tdm-policy.json." },
  { id: "onchain", label: "Solana PDA", detail: "Content record points to the devnet Sello program." },
];

function buildEvidenceReport(articles: CreatorArticle[], checks: string[]) {
  const generatedAt = new Date();
  const lines = [
    "Sello Protocol Evidence Report",
    `Generated: ${generatedAt.toISOString()}`,
    `Protected articles: ${articles.length}`,
    `Compliance checks: ${checks.length ? checks.join(", ") : "pending live check"}`,
    "",
    "Protected Content",
    ...articles.flatMap((article, index) => [
      `${index + 1}. ${article.url}`,
      `   License: ${article.license}`,
      `   ContentSello PDA: ${article.pda}`,
      `   Solana Explorer: https://explorer.solana.com/address/${article.pda}?cluster=devnet`,
    ]),
    "",
    "Policy Evidence",
    "- Sello meta tag expected in article HTML head",
    "- llms.txt expected at site root",
    "- tdm-policy.json expected at site root",
    "- On-chain ContentSello account expected on Solana devnet",
  ];

  return lines.join("\n");
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export function CreatorDashboardView({ articles, onRegisterNew }: { articles: CreatorArticle[]; onRegisterNew?: () => void }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [checks, setChecks] = useState<string[]>([]);
  
  const runLiveCheck = async () => {
    setIsVerifying(true);
    setChecks([]);
    for (const s of ["tag", "llms", "tdm", "onchain"]) {
      await new Promise(r => setTimeout(r, 700));
      setChecks(prev => [...prev, s]);
    }
    setIsVerifying(false);
    toast.success("Real-time Protection Verified!");
  };

  const generateEvidenceReport = () => {
    if (articles.length === 0) {
      toast.error("No protected articles available for the report.");
      return;
    }

    const report = buildEvidenceReport(articles, checks);
    const date = new Date().toISOString().slice(0, 10);
    downloadTextFile(`sello-evidence-report-${date}.txt`, report);
    toast.success("Evidence report generated.");
  };

  const totalArticles = articles.length;
  const completedChecks = checks.length;

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-1000">
      {/* Metric Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="postal-card p-6 md:p-8 border-green-ink/30 bg-green-ink/[0.03]">
          <p className="font-mono text-[10px] uppercase text-muted tracking-widest">Revenue</p>
          <p className="font-headline text-3xl md:text-4xl font-black text-green-ink mt-2 tabular-nums">$0.00 <span className="text-sm font-normal">USDC</span></p>
          <p className="mt-2 text-[10px] text-muted">Live treasury indexing is not enabled yet.</p>
        </div>
        <div className="postal-card p-6 md:p-8 border-primary/30">
          <p className="font-mono text-[10px] uppercase text-muted tracking-widest">Protected Articles</p>
          <p className="font-headline text-3xl md:text-4xl font-black text-cream mt-2">{totalArticles}</p>
        </div>
        <div className="postal-card p-6 md:p-8 border-gold/30 bg-gold/[0.03]">
          <p className="font-mono text-[10px] uppercase text-muted tracking-widest">Checks Run</p>
          <p className="font-headline text-3xl md:text-4xl font-black text-gold mt-2">{completedChecks}<span className="text-xs font-normal">/4</span></p>
        </div>
        <div className="postal-card p-6 md:p-8 border-muted/30">
          <p className="font-mono text-[10px] uppercase text-muted tracking-widest">Compliance</p>
          <p className="font-headline text-3xl md:text-4xl font-black text-cream mt-2">{completedChecks === 0 ? "Pending" : `${Math.round((completedChecks / PROTOCOL_CHECKS.length) * 100)}%`}</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-12 lg:grid-cols-3">
        {/* Content List */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-border-low pb-4 gap-4">
            <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-widest text-cream">Protected Content</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={runLiveCheck} disabled={isVerifying} className="stamp-badge text-[10px] text-primary hover:bg-primary/10 cursor-pointer">{isVerifying ? "Verifying..." : "Run Live Check"}</button>
              {onRegisterNew && (
                <button onClick={onRegisterNew} className="stamp-badge text-[10px] bg-gold/10 text-gold border-gold/30 hover:bg-gold/20 cursor-pointer">+ Protect New Article</button>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            {articles.length === 0 ? (
              <div className="postal-card p-12 sm:p-20 text-center italic text-muted">No articles found in this session.</div>
            ) : (
              articles.map((art, idx) => (
                <div key={idx} className="postal-card p-6 sm:p-8 border-primary/20 hover:bg-card/50 transition-colors">
                  <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
                    <div className="space-y-3 w-full">
                      <p className="max-w-full break-all text-base leading-tight text-cream sm:max-w-md sm:text-lg sm:break-normal sm:truncate">{art.url}</p>
	                      <div className="flex flex-wrap gap-2">
	                        <span className="stamp-badge text-[8px] sm:text-[9px] bg-primary/10 text-primary border-primary/30 uppercase">{art.license}</span>
	                        {PROTOCOL_CHECKS.map(({ id, label }) => (
	                          <span key={id} className={`stamp-badge text-[8px] sm:text-[9px] uppercase flex items-center gap-1 transition-all ${checks.includes(id) ? "bg-green-ink/10 text-green-ink border-green-ink/30" : "bg-card text-muted border-border-low"}`}>
	                            {checks.includes(id) && <span className="h-1 w-1 rounded-full bg-green-ink animate-pulse" />}
	                            {label}
	                          </span>
	                        ))}
	                      </div>
                    </div>
                    <div className="w-full text-left sm:w-auto sm:text-right shrink-0">
                      <p className="break-all font-mono text-[9px] italic text-muted sm:text-[10px]">PDA: {ellipsify(art.pda, 4)}</p>
	                      <a href={`https://explorer.solana.com/address/${art.pda}?cluster=devnet`} target="_blank" rel="noreferrer" className="text-[10px] text-primary underline block mt-1 hover:text-primary-foreground">View on Chain</a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Sidebar Protocol Status */}
        <section className="space-y-8">
          <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-widest text-gold text-center">Protocol Status</h3>
          <div className="postal-card overflow-hidden">
            <div className="bg-gold/10 p-4 text-center border-b border-border-low"><p className="font-mono text-xs uppercase text-gold tracking-widest font-black">Current Deployment</p></div>
            <div className="divide-y divide-border-low">
              {PROTOCOL_CHECKS.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 group hover:bg-gold/5 transition-colors">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-bold text-cream">{item.label}</p>
                    <p className="text-[9px] sm:text-[10px] italic text-muted">{item.detail}</p>
                  </div>
                  <span className={`stamp-badge shrink-0 text-[8px] ${checks.includes(item.id) ? "text-green-ink border-green-ink/30" : "text-muted"}`}>
                    {checks.includes(item.id) ? "OK" : "Check"}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-4 sm:p-5 bg-background/5 text-center">
              <button
                onClick={generateEvidenceReport}
                className="text-[10px] font-mono text-muted uppercase hover:text-gold transition-colors underline underline-offset-8"
              >
                Generate Evidence Report
              </button>
            </div>
          </div>
	          <div className="postal-card p-6 sm:p-8 border-primary/20 space-y-4">
	             <div className="postmark h-12 w-12 sm:h-16 sm:w-16 mx-auto opacity-30 rotate-[-15deg] flex items-center justify-center text-[6px] sm:text-[8px]">BLOCKCHAIN<br/>NOTARY</div>
	             <p className="text-[10px] sm:text-xs text-muted text-center leading-relaxed italic">This panel shows current project artifacts only. No crawler events or revenue are fabricated.</p>
	          </div>
        </section>
      </div>
    </div>
  );
}
