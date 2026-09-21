import { FeatureBookCard } from "./FeatureBookCard";
import type { ProductFeature } from "@/lib/digital-heroes";

const features: ProductFeature[] = [
  {
    id: "scores",
    title: "Score Tracking",
    category: "Your game",
    description:
      "Maintain your latest scores so your most recent eligible results can support draw participation.",
    access: "premium",
    href: "#how-it-works",
  },
  {
    id: "membership",
    title: "Subscription & Membership",
    category: "Access",
    description:
      "See what membership unlocks and choose an available plan when subscriptions are connected.",
    access: "standard",
    href: "#membership",
  },
  {
    id: "draws",
    title: "Prize Draws",
    category: "Participation",
    description:
      "Understand how eligible members and maintained scores connect to upcoming prize draws.",
    access: "premium",
    href: "#how-it-works",
  },
  {
    id: "charity",
    title: "Charity Contributions",
    category: "Impact",
    description:
      "Learn how part of the subscription contribution supports the platform’s charitable purpose.",
    access: "standard",
    href: "#impact",
  },
  {
    id: "verification",
    title: "Winner Verification",
    category: "Trust",
    description:
      "A clear verification step helps confirm eligibility before a draw outcome can be completed.",
    access: "premium",
    href: "#how-it-works",
  },
  {
    id: "dashboard",
    title: "User Dashboard",
    category: "Account",
    description:
      "A future member area will bring scores, draw participation, and subscription status together.",
    access: "premium",
    href: "#membership",
  },
];

export function Capabilities() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-32">
      <p className="label-mono">The experience</p>
      <h2 className="mt-6 text-3xl tracking-[-0.02em] sm:text-4xl">
        Everything your round can unlock.
      </h2>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Open each card to see how the Digital Heroes experience fits together.
      </p>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <FeatureBookCard
            key={feature.id}
            feature={feature}
            number={String(index + 1).padStart(2, "0")}
          />
        ))}
      </div>
    </section>
  );
}
