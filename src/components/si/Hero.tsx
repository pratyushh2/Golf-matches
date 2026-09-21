import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GolfVisual } from "./GolfVisual";

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-[100svh] items-center pt-16">
      <div className="relative mx-auto w-full max-w-6xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="text-[0.78rem] tracking-[0.1em] text-muted-foreground">
              Golf that gives back
            </p>
            <h1 className="mt-8 max-w-3xl text-[2.6rem] leading-[1.04] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-[4.2rem]">
              Play your game.
              <br />
              <span className="text-muted-foreground">Make it count.</span>
            </h1>
            <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground">
              Digital Heroes brings golf scores, member draws, prizes, and charitable giving into
              one considered experience.
            </p>

            <div id="join" className="mt-12 flex flex-wrap items-center gap-5">
              <Button asChild size="lg" className="h-12 rounded-sm px-6">
                <a href="#membership">
                  Explore membership <ArrowRight aria-hidden />
                </a>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>
          </div>

          <div className="pointer-events-none hidden md:col-span-5 md:block">
            <GolfVisual className="mx-auto h-[62vh] w-full max-w-[420px] opacity-80" />
          </div>
        </div>
      </div>
    </section>
  );
}
