import { useEffect, useRef, useState } from "react";

const stages = [
  { n: "01", label: "Input", copy: "Upload a WAV or IQ signal." },
  { n: "02", label: "Detect", copy: "Identify the signal structure and characteristics." },
  { n: "03", label: "Preprocess", copy: "Prepare the signal for reliable analysis." },
  { n: "04", label: "DSP", copy: "Apply digital signal processing to reveal useful patterns." },
  { n: "05", label: "Synchronize", copy: "Align the signal for consistent analysis." },
  { n: "06", label: "Features", copy: "Extract measurable characteristics from the signal." },
  { n: "07", label: "AI", copy: "Use learned patterns to classify the signal." },
  { n: "08", label: "Result", copy: "Return a classification and supporting signal insights." },
];

export function Pipeline() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let raf = 0;
    let target = 0;
    let current = 0;

    const compute = () => {
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      target = total <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / total));
    };

    const tick = () => {
      current += (target - current) * 0.12;
      setP(current);
      raf = requestAnimationFrame(tick);
    };

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  const active = Math.min(stages.length - 1, Math.floor(p * stages.length + 0.0001));

  return (
    <section id="how-it-works" ref={sectionRef} className="relative h-[420svh]">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-6">
          {/* orbital arc */}
          <div
            className="pointer-events-none absolute top-1/2 -right-[24vh] hidden -translate-y-1/2 lg:block"
            style={{ transform: `translateY(-50%) rotate(${p * 180 - 90}deg)` }}
          >
            <svg width="640" height="640" viewBox="0 0 640 640" className="opacity-70">
              <circle
                cx="320"
                cy="320"
                r="300"
                fill="none"
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="940 1885"
              />
              <circle
                cx="320"
                cy="320"
                r="240"
                fill="none"
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="4 10"
                opacity="0.6"
              />
              <circle cx="620" cy="320" r="4" fill="var(--signal)" />
              <circle cx="620" cy="320" r="12" fill="none" stroke="var(--signal)" strokeWidth="1" opacity="0.35" />
            </svg>
          </div>

          <div className="relative">
            <p className="label-mono">Process</p>
            <h2 className="mt-6 text-3xl tracking-[-0.02em] sm:text-4xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">From raw signal to interpretable insight.</p>

            {/* strip */}
            <div className="mt-14 hidden items-center gap-3 md:flex">
              {stages.map((s, i) => (
                <div key={s.n} className="flex items-center gap-3">
                  <div
                    className="border px-3 py-2 transition-all duration-500"
                    style={{
                      borderColor: i === active ? "var(--signal)" : "var(--border)",
                      color: i === active ? "var(--foreground)" : "var(--muted-foreground)",
                      background: i === active ? "color-mix(in oklab, var(--surface) 70%, transparent)" : "transparent",
                      opacity: i === active ? 1 : i < active ? 0.75 : 0.45,
                    }}
                  >
                    <span className="font-mono text-[0.7rem] tracking-[0.12em]">{s.n}</span>
                    <span className="ml-2 text-[0.8rem]">{s.label}</span>
                  </div>
                  {i < stages.length - 1 && <span className="font-mono text-xs text-border-strong">→</span>}
                </div>
              ))}
            </div>

            {/* progress rail with travelling particle */}
            <div className="relative mt-10 h-px w-full bg-border">
              <div
                className="absolute top-0 left-0 h-px bg-signal transition-none"
                style={{ width: `${p * 100}%` }}
              />
              <div
                className="absolute -top-[3px] h-[7px] w-[7px] rounded-full bg-signal"
                style={{ left: `calc(${p * 100}% - 3px)` }}
              />
            </div>

            {/* active stage explanation */}
            <div className="mt-12 grid gap-8 md:grid-cols-12">
              <div className="md:col-span-5">
                <p className="font-mono text-[0.7rem] tracking-[0.16em] text-signal">{stages[active]!.n}</p>
                <h3 className="mt-4 text-2xl tracking-[-0.02em] sm:text-3xl">{stages[active]!.label}</h3>
                <p className="mt-4 max-w-sm leading-relaxed text-muted-foreground">{stages[active]!.copy}</p>
              </div>
              <div className="md:col-span-5 md:col-start-8">
                <ol className="space-y-2 md:hidden">
                  {stages.map((s, i) => (
                    <li
                      key={s.n}
                      className="flex items-baseline gap-3 text-sm transition-opacity duration-500"
                      style={{ opacity: i === active ? 1 : 0.4 }}
                    >
                      <span className="font-mono text-[0.7rem] text-signal">{s.n}</span>
                      <span>{s.label}</span>
                    </li>
                  ))}
                </ol>
                <div className="hidden space-y-3 md:block">
                  {stages.map((s, i) => (
                    <div key={s.n} className="flex items-center gap-4">
                      <div
                        className="h-px transition-all duration-500"
                        style={{
                          width: i === active ? "72px" : "28px",
                          background: i === active ? "var(--signal)" : "var(--border)",
                        }}
                      />
                      <span
                        className="text-[0.8rem] transition-opacity duration-500"
                        style={{ opacity: i === active ? 1 : 0.4 }}
                      >
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
