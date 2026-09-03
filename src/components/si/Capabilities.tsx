import { ImagesBadge } from "@/components/ui/images-badge";
import { filingDocSets } from "./FilingDocs";

type Item = {
  n: string;
  title: string;
  copy: string;
  set: keyof typeof filingDocSets;
  href: string;
  spread: number;
  rotation: number;
};

const items: Item[] = [
  { n: "01", title: "Risk Factors", copy: "Item 1A risk disclosures and key risks.", set: "risk", href: "#analyze", spread: 58, rotation: 11 },
  { n: "02", title: "Legal Proceedings", copy: "Lawsuits, litigation and legal matters.", set: "legal", href: "#analyze", spread: 62, rotation: 9 },
  { n: "03", title: "Supply Chain", copy: "Supplier risks and operational dependencies.", set: "supply", href: "#analyze", spread: 56, rotation: 13 },
  { n: "04", title: "Cybersecurity", copy: "Security threats, breaches and mitigations.", set: "cyber", href: "#analyze", spread: 60, rotation: 10 },
  { n: "05", title: "Risk Changes", copy: "Year-over-year risk comparison.", set: "changes", href: "#analyze", spread: 64, rotation: 8 },
  { n: "06", title: "AI Insights", copy: "Ask anything and get evidence-backed answers.", set: "ai", href: "#analyze", spread: 58, rotation: 12 },
];

export function Capabilities() {
  return (
    <section id="uncover" className="mx-auto max-w-6xl px-6 py-32">
      <p className="label-mono">Capabilities</p>
      <h2 className="mt-6 text-3xl tracking-[-0.02em] sm:text-4xl">What can you uncover?</h2>
      <p className="mt-3 text-muted-foreground">Explore key insights hidden in annual filings.</p>

      <div className="mt-20 grid gap-y-24 gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => {
          const docs = filingDocSets[it.set]!;
          return (
            <a
              key={it.n}
              href={it.href}
              className="group relative block rounded-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            >
              <div className="flex min-h-[130px] items-end justify-center">
                <ImagesBadge
                  images={docs.map((d) => d.node)}
                  hoverSpread={it.spread}
                  hoverRotation={it.rotation}
                />
              </div>
              <div className="mt-8">
                <div className="rule-line" />
                <div className="mt-5 flex items-baseline justify-between gap-4">
                  <h3 className="text-lg tracking-[-0.01em] text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                    {it.title}
                  </h3>
                  <span className="font-mono text-[0.65rem] tracking-[0.14em] text-muted-foreground">{it.n}</span>
                </div>
                <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-muted-foreground">{it.copy}</p>
                <span className="hover-arrow mt-4 inline-flex items-center gap-2 text-[0.8rem] text-muted-foreground transition-colors group-hover:text-foreground">
                  Explore <span className="arrow font-mono text-signal">→</span>
                </span>
                <span className="sr-only">
                  {docs.map((d) => d.alt).join("; ")}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
