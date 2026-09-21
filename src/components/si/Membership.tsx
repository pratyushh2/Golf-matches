import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const standardFeatures = [
  "Learn how Digital Heroes works",
  "Explore charity participation",
  "Prepare your player profile",
];
const premiumFeatures = [
  "Maintain eligible golf scores",
  "Participate in available draws",
  "Access member account tools",
];

function AccessList({ items }: { items: string[] }) {
  return (
    <ul className="mt-8 space-y-4">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
        >
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Membership() {
  return (
    <section id="membership" className="mx-auto max-w-6xl px-6 pb-40">
      <p className="label-mono">Membership</p>
      <div className="mt-6 grid gap-8 md:grid-cols-12">
        <div className="md:col-span-4">
          <h2 className="text-3xl sm:text-4xl">Choose how you take part.</h2>
          <p className="mt-5 max-w-sm leading-relaxed text-muted-foreground">
            Start by exploring the platform, then choose membership when you are ready to enter
            scores and participate in draws.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Plan availability, billing, and account status will be connected to the live service
            later.
          </p>
        </div>

        <div className="grid gap-6 md:col-span-7 md:col-start-6 sm:grid-cols-2">
          <article className="border border-border bg-background/50 p-6 backdrop-blur-sm">
            <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[0.58rem] tracking-[0.12em] text-muted-foreground uppercase">
              Included
            </span>
            <h3 className="mt-8 text-xl">Standard access</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Understand the experience before deciding to subscribe.
            </p>
            <AccessList items={standardFeatures} />
          </article>

          <article className="border border-border-strong bg-surface/70 p-6 backdrop-blur-sm">
            <span className="rounded-full border border-signal/50 px-2.5 py-1 font-mono text-[0.58rem] tracking-[0.12em] text-signal uppercase">
              Premium
            </span>
            <h3 className="mt-8 text-xl">Subscriber access</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Unlock the member journey when subscriptions become available.
            </p>
            <AccessList items={premiumFeatures} />
            <Button
              asChild
              variant="outline"
              className="mt-8 w-full justify-between bg-transparent"
            >
              <a href="#join">
                Continue to signup <ArrowRight aria-hidden />
              </a>
            </Button>
          </article>
        </div>
      </div>
    </section>
  );
}
