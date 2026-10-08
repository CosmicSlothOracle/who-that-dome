import type { ThemeId } from "@/lib/types";

type Props = { playing: boolean; size?: number };

const cls = (playing: boolean, base: string) => `${base} ${playing ? "" : "t-paused"}`;

/** Lautsprecher mit Lochraster und Klickrad (speaker-yellow). */
function Speaker({ playing, size = 320 }: Props) {
  const dots: { x: number; y: number; d: number }[] = [];
  const step = 20;
  for (let y = -6; y <= 6; y += 1) {
    for (let x = -6; x <= 6; x += 1) {
      const px = x * step + (y % 2 ? step / 2 : 0);
      const py = y * step * 0.9;
      const r = Math.hypot(px, py);
      if (r < 118) dots.push({ x: Math.round(px * 10) / 10, y: Math.round(py * 10) / 10, d: Math.round(r * 10) / 10 });
    }
  }
  return (
    <svg viewBox="-150 -150 300 300" width={size} height={size} aria-hidden>
      <circle r="146" fill="currentColor" opacity="0.1" />
      {dots.map((dot, index) => (
        <circle
          key={index}
          cx={dot.x}
          cy={dot.y}
          r={Math.round((5.4 - dot.d / 40) * 100) / 100}
          fill="currentColor"
          className={playing ? "t-dot" : ""}
          style={{ animationDelay: `${Math.round((dot.d / 118) * 90) / 100}s` }}
        />
      ))}
    </svg>
  );
}

/** Zwei Spulen (reel-beige). */
function Reels({ playing, size = 320 }: Props) {
  const reel = (cx: number, rev: boolean) => (
    <g transform={`translate(${cx} 0)`}>
      <circle r="62" fill="currentColor" opacity="0.1" />
      <g className={cls(playing, rev ? "t-spin-rev" : "t-spin")}>
        {[0, 120, 240].map((angle) => (
          <path
            key={angle}
            transform={`rotate(${angle})`}
            d="M-16 -50 A52 52 0 0 1 16 -50 L10 -28 A30 30 0 0 0 -10 -28 Z"
            fill="currentColor"
          />
        ))}
        <circle r="17" fill="currentColor" />
        <path d="M0 -7 L7 5 L-7 5 Z" fill="var(--t-bg)" />
      </g>
    </g>
  );
  return (
    <svg viewBox="-150 -80 300 160" width={size} height={size * (160 / 300)} aria-hidden>
      {reel(-76, false)}
      {reel(76, true)}
    </svg>
  );
}

/** Schallplatte mit orangem Label und Tonarm (turntable-orange). */
function Turntable({ playing, size = 320 }: Props) {
  return (
    <svg viewBox="-150 -150 300 300" width={size} height={size} aria-hidden>
      <circle r="146" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="3" />
      <g className={cls(playing, "t-spin")}>
        <circle r="134" fill="#1c1c1c" />
        {[100, 112, 124].map((r) => (
          <circle key={r} r={r} fill="none" stroke="#3a3a3a" strokeWidth="1" />
        ))}
        {Array.from({ length: 48 }, (_, i) => (
          <line key={i} x1="0" y1="-52" x2="0" y2="-44" stroke="var(--t-accent)" strokeWidth="2.4" transform={`rotate(${i * 7.5})`} />
        ))}
        <circle r="38" fill="var(--t-accent)" />
        <circle r="5" fill="#1c1c1c" />
        <line x1="0" y1="0" x2="-20" y2="-22" stroke="#1c1c1c" strokeWidth="3" />
      </g>
      <path d="M122 -118 A168 168 0 0 1 138 -40" fill="none" stroke="#1c1c1c" strokeWidth="9" strokeLinecap="round" />
    </svg>
  );
}

/** Kassette im Pixel-Stil (cassette-pixel). */
function Cassette({ playing, size = 320 }: Props) {
  const reel = (cx: number) => (
    <g transform={`translate(${cx} 0)`}>
      <circle r="42" fill="#a5f0e6" />
      <g className={cls(playing, "t-spin")}>
        <circle r="22" fill="#0e5c58" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <rect key={a} x="-3" y="-22" width="6" height="9" fill="#a5f0e6" transform={`rotate(${a})`} />
        ))}
        <circle r="7" fill="#4aa3a0" />
      </g>
    </g>
  );
  return (
    <svg viewBox="-150 -100 300 200" width={size} height={size * (200 / 300)} shapeRendering="crispEdges" aria-hidden>
      <rect x="-144" y="-92" width="288" height="184" fill="#1d6f6a" stroke="#0e3f3c" strokeWidth="6" />
      <rect x="-124" y="-70" width="248" height="86" fill="#0e3f3c" />
      {reel(-62)}
      {reel(62)}
      <rect x="-36" y="-38" width="72" height="30" fill="none" stroke="#a5f0e6" strokeWidth="3" opacity="0.7" />
      <rect x="-90" y="30" width="180" height="46" fill="#f2cf94" />
      <rect x="-80" y="42" width="160" height="6" fill="#9a7d4a" />
      <rect x="-80" y="56" width="110" height="6" fill="#9a7d4a" />
      {[-132, 132].flatMap((x) => [-80, 80].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="5" fill="#a5f0e6" />))}
    </svg>
  );
}

/** Diktiergerät mit Wellenform (dictaphone-red). */
function Dictaphone({ playing, size = 320 }: Props) {
  const bars = Array.from({ length: 28 }, (_, i) => Math.round(6 + Math.abs(Math.sin(i * 1.7) * 26) + (i % 5) * 2));
  return (
    <svg viewBox="-150 -120 300 240" width={size} height={size * (240 / 300)} aria-hidden>
      <rect x="-140" y="-112" width="280" height="224" rx="26" fill="#efe7d6" />
      <rect x="-122" y="-96" width="244" height="104" rx="12" fill="#1d1d1b" />
      <circle cx="-108" cy="-82" r="4" fill="#f0493e" className={playing ? "t-dot" : ""} />
      {bars.map((h, i) => (
        <rect
          key={i}
          x={-104 + i * 7.6}
          y={-44 - h / 2}
          width="3"
          height={h}
          fill="#efe7d6"
          className={playing ? "t-bar" : ""}
          style={{ animationDelay: `${(i % 9) * 0.1}s` }}
        />
      ))}
      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 24 }, (_, col) => (
          <circle key={`${row}-${col}`} cx={-110 + col * 9.6} cy={26 + row * 8} r="2" fill="#1d1d1b" opacity="0.55" />
        )),
      )}
      <rect x="-122" y="74" width="120" height="26" rx="8" fill="#f0493e" />
      <rect x="-32" y="74" width="74" height="26" rx="8" fill="#c9cbc0" />
      <rect x="52" y="74" width="70" height="26" rx="8" fill="#c9cbc0" />
    </svg>
  );
}

export function Device({ theme, playing, size }: { theme: ThemeId } & Partial<Props>) {
  const props = { playing: Boolean(playing), size };
  switch (theme) {
    case "speaker-yellow":
      return <Speaker {...props} />;
    case "reel-beige":
      return <Reels {...props} />;
    case "cassette-pixel":
      return <Cassette {...props} />;
    case "dictaphone-red":
      return <Dictaphone {...props} />;
    default:
      return <Turntable {...props} />;
  }
}
