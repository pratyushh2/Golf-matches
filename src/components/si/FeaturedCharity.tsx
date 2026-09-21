import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getFeaturedCharity, type Charity } from "@/lib/charityService";
import { Heart, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FeaturedCharity() {
  const [charity, setCharity] = useState<Charity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getFeaturedCharity()
      .then((c) => {
        if (mounted) {
          setCharity(c);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load featured charity:", err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="impact" className="mx-auto max-w-6xl px-6 pb-32">
      <div className="rule-line" />
      <div className="grid gap-8 pt-12 md:grid-cols-12">
        <div className="md:col-span-3">
          <p className="label-mono">The cause behind the game</p>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-emerald-300">
            <Heart className="h-3 w-3" /> Charity partner
          </span>
        </div>

        <div className="md:col-span-8 md:col-start-5">
          <h2 className="text-3xl sm:text-4xl text-white">A contribution beyond the course.</h2>
          <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
            Every Digital Heroes membership directs a minimum of 10% toward a partner charity of
            your choice. Play golf, enter monthly prize draws, and make a real difference.
          </p>

          {loading ? (
            <div className="mt-8 h-32 animate-pulse rounded-2xl border border-border bg-surface/50 p-6" />
          ) : charity ? (
            <div className="mt-8 rounded-2xl border border-border-strong bg-surface/70 p-6 sm:p-8 backdrop-blur-sm card-lift">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-signal">
                    {charity.category ?? "Featured Charity"}
                  </span>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{charity.name}</h3>
                </div>
                {charity.website_url && (
                  <a
                    href={charity.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition"
                  >
                    Visit website <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              {charity.description && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {charity.description}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-4 pt-4 border-t border-border/50">
                <Button
                  asChild
                  variant="outline"
                  className="bg-transparent border-border-strong hover:bg-white/5"
                >
                  <Link to="/charity">
                    Explore all charities <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Link to="/signup" className="text-xs text-signal hover:underline">
                  Join and select your cause →
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-border bg-surface/40 p-6">
              <p className="text-sm text-muted-foreground">
                Explore our directory of verified charity partners and select the cause you want
                your membership to support.
              </p>
              <Button asChild variant="outline" className="mt-4 bg-transparent">
                <Link to="/charity">
                  Explore charities <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default FeaturedCharity;
