import { createFileRoute } from "@tanstack/react-router";
import { ThemeProvider } from "@/lib/theme";
import { ParticleField } from "@/components/si/ParticleField";
import { Header, Footer } from "@/components/si/Chrome";
import { Hero } from "@/components/si/Hero";
import { Pipeline } from "@/components/si/Pipeline";
import { Capabilities } from "@/components/si/Capabilities";
import { Membership } from "@/components/si/Membership";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Digital Heroes — Golf that gives back" },
      {
        name: "description",
        content:
          "A modern golf membership experience connecting scores, prize draws, and charitable giving.",
      },
      { property: "og:title", content: "Digital Heroes — Golf that gives back" },
      {
        property: "og:description",
        content:
          "Discover a golf membership experience built around play, prize draws, and charitable impact.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ThemeProvider>
      <div className="relative min-h-screen">
        <ParticleField />
        <Header />
        <main>
          <Hero />
          <Capabilities />
          <Pipeline />
          <section id="impact" className="mx-auto max-w-6xl px-6 pb-32">
            <div className="rule-line" />
            <div className="grid gap-8 pt-12 md:grid-cols-12">
              <p className="label-mono md:col-span-3">Charity impact</p>
              <div className="md:col-span-7 md:col-start-5">
                <h2 className="text-3xl sm:text-4xl">A contribution beyond the course.</h2>
                <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
                  Part of the subscription contribution is intended to support charity. Live charity
                  partners and contribution information will appear here once connected.
                </p>
              </div>
            </div>
          </section>
          <Membership />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
