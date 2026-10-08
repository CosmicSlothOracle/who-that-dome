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

/** Jukebox mit Bogenfenster und Platte (jukebox-wood). */
function Jukebox({ playing, size = 320 }: Props) {
  return (
    <svg viewBox="-150 -160 300 320" width={size} height={size * (320 / 300)} aria-hidden>
      <path d="M-112 150 V-30 A112 112 0 0 1 112 -30 V150 Z" fill="#7a4524" />
      <path d="M-98 140 V-28 A98 98 0 0 1 98 -28 V140 Z" fill="#2b1608" />
      <path d="M-86 -28 A86 86 0 0 1 86 -28" fill="none" stroke="#f0a21f" strokeWidth="9" strokeLinecap="round" />
      <path d="M-100 150 V-28 A100 100 0 0 1 100 -28 V150" fill="none" stroke="#f0a21f" strokeWidth="4" opacity="0.5" />
      <g transform="translate(0 -8)">
        <circle r="62" fill="#120a04" />
        <g className={cls(playing, "t-spin")}>
          <circle r="56" fill="#1c1c1c" />
          {[40, 48].map((r) => (<circle key={r} r={r} fill="none" stroke="#3a3a3a" />))}
          <circle r="20" fill="#f0a21f" />
          <circle r="3" fill="#1c1c1c" />
        </g>
        <path d="M44 -52 L8 -6" stroke="#cfcfcf" strokeWidth="5" strokeLinecap="round" />
      </g>
      <rect x="-70" y="72" width="140" height="44" rx="8" fill="#f1d9a8" />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x={-60 + i * 18} y="80" width="12" height="28" rx="3" fill={i % 2 ? "#f0a21f" : "#b3361f"} className={playing ? "t-dot" : ""} style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </svg>
  );
}

/** Sonnenuntergang über Grid mit Equalizer (neon-grid). */
function NeonGrid({ playing, size = 320 }: Props) {
  return (
    <svg viewBox="-150 -110 300 220" width={size} height={size * (220 / 300)} aria-hidden>
      <defs>
        <linearGradient id="ng-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe14d" />
          <stop offset="1" stopColor="#ff3fa4" />
        </linearGradient>
        <clipPath id="ng-clip"><rect x="-150" y="-110" width="300" height="130" /></clipPath>
      </defs>
      <g clipPath="url(#ng-clip)">
        <circle cy="-24" r="74" fill="url(#ng-sun)" />
        {[-4, 8, 20, 32, 44].map((y, i) => (
          <rect key={y} x="-80" y={y} width="160" height={2 + i * 1.6} fill="#1a0b2e" />
        ))}
      </g>
      <path d="M-150 20 L-90 -18 L-60 6 L-20 -26 L20 6 L60 -14 L150 20 Z" fill="#12062a" opacity="0.9" />
      <line x1="-150" y1="20" x2="150" y2="20" stroke="#7ef9ff" strokeWidth="2" />
      {[-120, -80, -40, 0, 40, 80, 120].map((x) => (
        <line key={x} x1={x * 0.18} y1="20" x2={x * 1.7} y2="110" stroke="#7ef9ff" strokeWidth="1.2" opacity="0.7" />
      ))}
      {[30, 44, 62, 86].map((y) => (
        <line key={y} x1="-150" y1={y} x2="150" y2={y} stroke="#7ef9ff" strokeWidth="1.2" opacity="0.7" />
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={-91 + i * 13} y="-100" width="8" height="26" fill={i % 2 ? "#ff3fa4" : "#7ef9ff"} className={playing ? "t-bar" : ""} style={{ animationDelay: `${(i % 7) * 0.12}s`, transformOrigin: "center bottom" }} />
      ))}
    </svg>
  );
}

/** Boombox mit zwei Lautsprechern (boombox-90s). */
function Boombox({ playing, size = 320 }: Props) {
  const speaker = (cx: number) => (
    <g transform={`translate(${cx} 18)`}>
      <circle r="52" fill="#10123a" />
      <circle r="46" fill="#232766" stroke="#2be0c9" strokeWidth="3" />
      <g className={playing ? "t-throb" : ""}>
        <circle r="26" fill="#10123a" />
        <circle r="12" fill="#2be0c9" />
      </g>
    </g>
  );
  return (
    <svg viewBox="-150 -100 300 200" width={size} height={size * (200 / 300)} aria-hidden>
      <path d="M-72 -58 V-80 H72 V-58" fill="none" stroke="#10123a" strokeWidth="9" strokeLinejoin="round" />
      <rect x="-142" y="-62" width="284" height="150" rx="18" fill="#6a4bd0" />
      <rect x="-130" y="-50" width="260" height="14" rx="4" fill="#10123a" />
      {speaker(-90)}
      {speaker(90)}
      <rect x="-42" y="-24" width="84" height="56" rx="6" fill="#10123a" />
      <rect x="-34" y="-17" width="68" height="34" rx="3" fill="#2be0c9" opacity="0.85" />
      <g className={cls(playing, "t-spin")}><circle cx="-16" cy="0" r="9" fill="#10123a" /></g>
      <g className={cls(playing, "t-spin")}><circle cx="16" cy="0" r="9" fill="#10123a" /></g>
      {[-32, -12, 8, 28].map((x, i) => (
        <rect key={x} x={x} y="42" width="16" height="12" rx="2" fill={["#ffd23f", "#ff6b81", "#f3f0ff", "#f3f0ff"][i]} />
      ))}
    </svg>
  );
}

/** Kino-Marquee mit Filmspule (cinema-marquee). */
function Cinema({ playing, size = 320 }: Props) {
  const bulbs: { x: number; y: number }[] = [];
  for (let i = 0; i < 12; i += 1) {
    bulbs.push({ x: -110 + i * 20, y: -88 }, { x: -110 + i * 20, y: 88 });
  }
  for (let j = 1; j < 8; j += 1) bulbs.push({ x: -120, y: -88 + j * 22 }, { x: 120, y: -88 + j * 22 });
  return (
    <svg viewBox="-150 -110 300 220" width={size} height={size * (220 / 300)} aria-hidden>
      <rect x="-130" y="-98" width="260" height="196" rx="12" fill="var(--t-pad)" stroke="var(--t-accent)" strokeWidth="4" />
      {bulbs.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r="5" fill="var(--t-on-bg)" className={playing ? (i % 2 ? "t-bulb-a" : "t-bulb-b") : ""} />
      ))}
      <g className={cls(playing, "t-spin")}>
        <circle r="60" fill="var(--t-accent)" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <circle key={a} cx="0" cy="-36" r="12" fill="var(--t-bg)" transform={`rotate(${a})`} />
        ))}
        <circle r="14" fill="var(--t-bg)" />
        <circle r="5" fill="var(--t-accent)" />
      </g>
    </svg>
  );
}

/** Controller mit Steuerkreuz und vier Buttons (arcade-gamepad). */
function Gamepad({ playing, size = 320 }: Props) {
  const btn = (cx: number, cy: number, color: string, delay: number) => (
    <circle cx={cx} cy={cy} r="14" fill={color} stroke="#0b0b22" strokeWidth="3" className={playing ? "t-dot" : ""} style={{ animationDelay: `${delay}s` }} />
  );
  return (
    <svg viewBox="-150 -90 300 180" width={size} height={size * (180 / 300)} shapeRendering="crispEdges" aria-hidden>
      <path d="M-120 -48 H120 a24 24 0 0 1 24 24 V34 a28 28 0 0 1 -28 28 H92 L70 40 H-70 L-92 62 H-116 a28 28 0 0 1 -28 -28 V-24 a24 24 0 0 1 24 -24 Z" fill="#c9c9e8" stroke="#0b0b22" strokeWidth="5" />
      <rect x="-86" y="-18" width="20" height="60" fill="#0b0b22" />
      <rect x="-106" y="2" width="60" height="20" fill="#0b0b22" />
      <rect x="-30" y="-30" width="60" height="30" fill="#0b0b22" />
      <rect x="-24" y="-24" width="48" height="18" fill="#5fe08a" opacity={playing ? 0.95 : 0.5} />
      {btn(86, -4, "#ff5d73", 0)}
      {btn(110, 18, "#ffd23f", 0.2)}
      {btn(62, 18, "#4dd0ff", 0.4)}
      {btn(86, 38, "#5fe08a", 0.6)}
      <rect x="-24" y="12" width="20" height="8" fill="#0b0b22" />
      <rect x="4" y="12" width="20" height="8" fill="#0b0b22" />
    </svg>
  );
}

/** Klappe mit schlagendem Balken (grindhouse-film). */
function Clapper({ playing, size = 320 }: Props) {
  return (
    <svg viewBox="-150 -110 300 220" width={size} height={size * (220 / 300)} aria-hidden>
      <rect x="-120" y="-30" width="240" height="128" fill="#140c06" />
      {[0, 1, 2].map((i) => (
        <line key={i} x1="-120" x2="120" y1={-6 + i * 34} y2={-6 + i * 34} stroke="#f6e7b8" strokeWidth="2" opacity="0.7" />
      ))}
      <text x="-108" y="-12" fill="#f6e7b8" fontSize="16" fontFamily="monospace" letterSpacing="3">SCENE   TAKE</text>
      <text x="-108" y="22" fill="#e2b007" fontSize="16" fontFamily="monospace" letterSpacing="3">VOL. 1  ·  CUT</text>
      <rect x="-120" y="-62" width="240" height="26" fill="#140c06" />
      {Array.from({ length: 8 }, (_, i) => (
        <polygon key={i} points={`${-120 + i * 30},-62 ${-90 + i * 30},-62 ${-100 + i * 30},-36 ${-130 + i * 30},-36`} fill={i % 2 ? "#e2b007" : "#f6e7b8"} />
      ))}
      <g className={playing ? "t-clap" : ""}>
        <rect x="-120" y="-96" width="240" height="26" fill="#140c06" />
        {Array.from({ length: 8 }, (_, i) => (
          <polygon key={i} points={`${-120 + i * 30},-96 ${-90 + i * 30},-96 ${-100 + i * 30},-70 ${-130 + i * 30},-70`} fill={i % 2 ? "#b3121a" : "#f6e7b8"} />
        ))}
      </g>
    </svg>
  );
}

/** CRT-Radio mit Skala und Nadel (pipboy-radio). */
function PipRadio({ playing, size = 320 }: Props) {
  const ticks = Array.from({ length: 21 }, (_, i) => -60 + i * 6);
  return (
    <svg viewBox="-150 -110 300 220" width={size} height={size * (220 / 300)} aria-hidden>
      <rect x="-138" y="-100" width="276" height="200" rx="26" fill="#0c2a15" stroke="#5dff8a" strokeWidth="4" />
      <rect x="-120" y="-84" width="240" height="168" rx="16" fill="#041008" stroke="#2f9a52" strokeWidth="2" />
      <g transform="translate(0 52)">
        <path d="M-96 0 A96 96 0 0 1 96 0" fill="none" stroke="#5dff8a" strokeWidth="2" opacity="0.8" />
        {ticks.map((a, i) => (
          <line key={a} x1="0" y1={i % 5 === 0 ? -100 : -96} x2="0" y2="-88" stroke="#5dff8a" strokeWidth={i % 5 === 0 ? 3 : 1.5} transform={`rotate(${a})`} />
        ))}
        <g className={playing ? "t-needle" : ""} style={playing ? undefined : { transform: "rotate(-8deg)", transformOrigin: "0 0" }}>
          <line x1="0" y1="0" x2="0" y2="-92" stroke="#b6ff6b" strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle r="7" fill="#5dff8a" />
      </g>
      <path d="M-100 -52 q10 -22 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#5dff8a" strokeWidth="2.5" className={playing ? "t-dot" : ""} />
      {Array.from({ length: 22 }, (_, i) => (
        <line key={i} x1="-120" x2="120" y1={-82 + i * 8} y2={-82 + i * 8} stroke="#000" strokeWidth="1" opacity="0.22" />
      ))}
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
    case "jukebox-wood":
      return <Jukebox {...props} />;
    case "neon-grid":
      return <NeonGrid {...props} />;
    case "boombox-90s":
      return <Boombox {...props} />;
    case "cinema-marquee":
    case "cinema-curtain":
      return <Cinema {...props} />;
    case "arcade-gamepad":
      return <Gamepad {...props} />;
    case "grindhouse-film":
      return <Clapper {...props} />;
    case "pipboy-radio":
      return <PipRadio {...props} />;
    default:
      return <Turntable {...props} />;
  }
}
