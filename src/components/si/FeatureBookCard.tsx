import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePrefersReducedMotion } from "@/lib/theme";
import type { ProductFeature } from "@/lib/digital-heroes";

export function FeatureBookCard({ feature, number }: { feature: ProductFeature; number: string }) {
  const [open, setOpen] = useState(false);
  const reduced = usePrefersReducedMotion();

  return (
    <article
      className="group/book relative h-[250px] [perspective:1200px]"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="absolute inset-0 overflow-hidden rounded-sm border border-border bg-surface/70 p-6">
        <div className="flex h-full flex-col justify-between pl-[27%] sm:pl-[31%]">
          <div>
            <p className="font-mono text-[0.62rem] tracking-[0.14em] text-signal uppercase">
              {feature.category}
            </p>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            className="h-auto w-fit px-0 py-2 text-xs text-foreground hover:bg-transparent"
          >
            <a href={feature.href}>
              Explore <ArrowRight aria-hidden />
            </a>
          </Button>
        </div>
      </div>

      <button
        type="button"
        aria-expanded={open}
        aria-label={`${open ? "Close" : "Open"} ${feature.title} feature card`}
        onClick={() => setOpen((value) => !value)}
        onFocus={() => setOpen(true)}
        onBlur={(event) => {
          if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) setOpen(false);
        }}
        className={`absolute inset-0 z-10 flex origin-left flex-col justify-between overflow-hidden rounded-sm border border-border-strong bg-card p-6 text-left shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
          reduced
            ? "transition-opacity duration-150"
            : "transition-transform duration-500 ease-out [transform-style:preserve-3d]"
        } ${open ? (reduced ? "pointer-events-none opacity-0" : "[transform:rotateY(-80deg)]") : "opacity-100 [transform:rotateY(0deg)]"}`}
      >
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-[0.62rem] tracking-[0.14em] text-muted-foreground">
            {number}
          </span>
          <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[0.58rem] tracking-[0.12em] text-signal uppercase">
            {feature.access === "premium" ? "Premium" : "Included"}
          </span>
        </div>
        <div>
          <div className="mb-5 h-px w-10 bg-signal/70" />
          <h3 className="max-w-[12ch] text-xl leading-tight text-foreground">{feature.title}</h3>
          <p className="mt-3 font-mono text-[0.6rem] tracking-[0.12em] text-muted-foreground uppercase">
            Open to learn more
          </p>
        </div>
      </button>
    </article>
  );
}
