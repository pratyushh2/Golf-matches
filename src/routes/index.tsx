import { createFileRoute } from "@tanstack/react-router";
import { ThemeProvider } from "@/lib/theme";
import { ParticleField } from "@/components/si/ParticleField";
import { Header, Footer } from "@/components/si/Chrome";
import { Hero } from "@/components/si/Hero";
import { Pipeline } from "@/components/si/Pipeline";
import { Capabilities } from "@/components/si/Capabilities";
import { FeaturedCharity } from "@/components/si/FeaturedCharity";
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
          <FeaturedCharity />
          <Membership />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
