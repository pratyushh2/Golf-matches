import { usePrefersReducedMotion } from "@/lib/theme";

export function GolfVisual({ className = "" }: { className?: string }) {
  const reduced = usePrefersReducedMotion();

  return (
    <div aria-hidden className={`relative ${className}`}>
      <svg viewBox="0 0 420 460" className="h-full w-full text-foreground" preserveAspectRatio="xMidYMid meet">
        <path
          d="M36 376C116 326 194 346 270 309C319 285 349 253 378 213"
          fill="none"
          stroke="var(--border-strong)"
          strokeWidth="1"
        />
        <path
          d="M24 400C112 356 200 377 290 338C337 318 368 293 397 260"
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
        />
        <path
          d="M44 344C133 295 210 324 278 284C323 258 349 226 371 187"
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
          opacity="0.65"
        />

        <path
          d="M65 322C109 118 259 88 349 229"
          fill="none"
          stroke="var(--signal)"
          strokeWidth="1.2"
          strokeDasharray="4 8"
          opacity="0.7"
        />
        <g className={reduced ? "" : "golf-ball-flight"}>
          <circle cx="65" cy="322" r="8" fill="var(--surface)" stroke="var(--signal)" />
          <circle cx="62" cy="319" r="1" fill="var(--border-strong)" />
          <circle cx="68" cy="320" r="1" fill="var(--border-strong)" />
          <circle cx="65" cy="325" r="1" fill="var(--border-strong)" />
        </g>

        <line x1="349" y1="144" x2="349" y2="286" stroke="var(--foreground)" strokeWidth="1.4" opacity="0.75" />
        <path d="M350 146L392 161L350 178Z" fill="var(--signal)" opacity="0.82" />
        <ellipse cx="349" cy="287" rx="23" ry="7" fill="none" stroke="var(--border-strong)" />

        <text x="36" y="58" className="font-mono" fontSize="9" letterSpacing="2.6" fill="var(--signal)">
          PLAY WITH PURPOSE
        </text>
        <line x1="36" y1="76" x2="384" y2="76" stroke="var(--border)" />
        <text x="36" y="99" fontSize="10" letterSpacing="1" fill="currentColor" opacity="0.48">
          YOUR GAME · A GREATER GOOD
        </text>
      </svg>
    </div>
  );
}