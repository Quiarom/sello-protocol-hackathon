import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Future of AI Licensing | Sello Protocol Demo",
  description: "A deep dive into why machine-readable rights are essential for the next generation of the web.",
  other: {
    sello: "id:CDPPzR|license:sello-voice|author:Daniel Quiaro|publisher:Sello Demo|pay:/api/narrate|onchain:solana:devnet:CDPPzRN3eeNiSABBiBZVXpUK4uxUAY8wBRemhfGHu2Ug|price_usdc:0.10|voice_id:Rachel (Default)"
  }
};

export default function DemoArticle() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
      <article className="postal-card p-8 sm:p-12 space-y-8">
        <header className="space-y-4 border-b border-border-low pb-8">
          <span className="stamp-badge text-primary">Protected Content</span>
          <h1 className="font-headline text-4xl sm:text-6xl font-black uppercase leading-tight text-cream">
            The Future of <br/> AI Licensing
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted">
            <span>By Daniel Quiaro</span>
            <span className="h-1 w-1 rounded-full bg-border-low" />
            <span>May 9, 2026</span>
          </div>
        </header>

        <section className="font-body space-y-6 text-base leading-relaxed text-muted sm:text-lg">
          <p className="first-letter:text-5xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
          <div className="bg-primary/5 border-l-4 border-primary p-6 italic text-cream">
            "Sello Protocol ensures that my work is respected by AI agents while enabling seamless monetization on Solana."
          </div>
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, 
            totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </p>
        </section>

        <footer className="pt-8 border-t border-border-low">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="font-display text-xl uppercase tracking-widest text-cream">Sello Certified</p>
              <p className="break-all text-[10px] uppercase font-mono tracking-tighter text-muted">Content Hash: 8xK2...mN | Verified On-Chain</p>
            </div>
            <div className="postmark h-16 w-16 opacity-20 flex items-center justify-center text-[6px] border-primary text-primary">
              SELLO<br/>SECURE
            </div>
          </div>
        </footer>
      </article>
      
      <div className="mt-12 text-center">
        <a href="/onboarding/agent" className="text-primary hover:underline font-mono text-xs uppercase tracking-widest">
          &larr; Back to Agent Simulator
        </a>
      </div>
    </main>
  );
}
