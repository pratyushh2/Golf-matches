export function PipelineVisual({ active, p }: { active: number; p: number }) {
  const nodes = Array.from({ length: 8 });

  return (
    <svg
      aria-hidden
      viewBox="0 0 360 360"
      className="h-full w-full text-foreground"
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d="M58 274C104 131 231 98 304 213"
        fill="none"
        stroke="var(--border-strong)"
        strokeWidth="1"
      />
      <path
        d="M42 299C129 256 205 281 319 239"
        fill="none"
        stroke="var(--border)"
        strokeWidth="1"
      />
      {nodes.map((_, i) => {
        const x = 58 + i * 35;
        const y = 274 - Math.sin((i / 7) * Math.PI) * 162;
        return (
          <g key={i} style={{ opacity: i <= active ? 1 : 0.22, transition: "opacity 500ms ease" }}>
            <circle
              cx={x}
              cy={y}
              r={i === active ? 6 : 3}
              fill={i === active ? "var(--signal)" : "currentColor"}
            />
            <text
              x={x}
              y={y + 18}
              textAnchor="middle"
              className="font-mono"
              fontSize="6.5"
              fill="currentColor"
              opacity="0.65"
            >
              {String(i + 1).padStart(2, "0")}
            </text>
          </g>
        );
      })}
      <line x1="304" y1="158" x2="304" y2="240" stroke="currentColor" opacity="0.65" />
      <path d="M305 159L335 171L305 183Z" fill="var(--signal)" opacity="0.8" />
      <circle cx={58 + p * 245} cy={274 - Math.sin(p * Math.PI) * 162} r="4" fill="var(--signal)" />
    </svg>
  );
}
