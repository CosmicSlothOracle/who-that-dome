import type { Pool, ThemeId } from "./types";

export type Theme = {
  id: ThemeId;
  name: string;
  font: "grotesk" | "mono" | "pixel";
  /** Farbtokens, werden als CSS-Variablen --t-* gesetzt. */
  colors: {
    bg: string;
    onBg: string;
    surface: string;
    onSurface: string;
    accent: string;
    onAccent: string;
    pad: string;
    onPad: string;
    muted: string;
    ok: string;
    bad: string;
  };
  radius: number;
  uppercase: boolean;
};

export const THEMES: Record<ThemeId, Theme> = {
  "speaker-yellow": {
    id: "speaker-yellow",
    name: "Lautsprecher",
    font: "grotesk",
    colors: {
      bg: "#ffd000",
      onBg: "#111111",
      surface: "#e9b900",
      onSurface: "#111111",
      accent: "#111111",
      onAccent: "#ffd000",
      pad: "#f2c200",
      onPad: "#111111",
      muted: "#6e5c00",
      ok: "#0b7a3b",
      bad: "#b3261e",
    },
    radius: 28,
    uppercase: false,
  },
  "reel-beige": {
    id: "reel-beige",
    name: "Tonband",
    font: "grotesk",
    colors: {
      bg: "#cfc4b8",
      onBg: "#17130f",
      surface: "#e3dacf",
      onSurface: "#17130f",
      accent: "#17130f",
      onAccent: "#e3dacf",
      pad: "#dcd2c6",
      onPad: "#17130f",
      muted: "#7b6e61",
      ok: "#2f7d4f",
      bad: "#b0382d",
    },
    radius: 24,
    uppercase: false,
  },
  "turntable-orange": {
    id: "turntable-orange",
    name: "Plattenspieler",
    font: "mono",
    colors: {
      bg: "#d7d7d7",
      onBg: "#1b1b1b",
      surface: "#e8e8e8",
      onSurface: "#1b1b1b",
      accent: "#ef7b1a",
      onAccent: "#1b1b1b",
      pad: "#cbcbcb",
      onPad: "#1b1b1b",
      muted: "#777777",
      ok: "#1f8a4c",
      bad: "#c0301f",
    },
    radius: 10,
    uppercase: true,
  },
  "cassette-pixel": {
    id: "cassette-pixel",
    name: "Kassette",
    font: "pixel",
    colors: {
      bg: "#2a3138",
      onBg: "#e6f4f1",
      surface: "#38434b",
      onSurface: "#e6f4f1",
      accent: "#9eeee3",
      onAccent: "#12302d",
      pad: "#33414a",
      onPad: "#e6f4f1",
      muted: "#8ea3a8",
      ok: "#6fe08f",
      bad: "#ff5d5d",
    },
    radius: 4,
    uppercase: true,
  },
  "dictaphone-red": {
    id: "dictaphone-red",
    name: "Diktiergerät",
    font: "grotesk",
    colors: {
      bg: "#1f4744",
      onBg: "#efe7d6",
      surface: "#efe7d6",
      onSurface: "#1d1d1b",
      accent: "#f0493e",
      onAccent: "#ffffff",
      pad: "#2b5955",
      onPad: "#efe7d6",
      muted: "#9db5b0",
      ok: "#7ee0a0",
      bad: "#ff8a80",
    },
    radius: 20,
    uppercase: false,
  },

  "jukebox-wood": {
    id: "jukebox-wood",
    name: "Jukebox",
    font: "grotesk",
    colors: {
      bg: "#4a2a17",
      onBg: "#ffe9c4",
      surface: "#f1d9a8",
      onSurface: "#2b1608",
      accent: "#f0a21f",
      onAccent: "#2b1608",
      pad: "#6b3d22",
      onPad: "#ffe9c4",
      muted: "#c9a47a",
      ok: "#8bd17c",
      bad: "#ff7a5c",
    },
    radius: 30,
    uppercase: false,
  },
  "neon-grid": {
    id: "neon-grid",
    name: "Neon",
    font: "mono",
    colors: {
      bg: "#1a0b2e",
      onBg: "#f6e9ff",
      surface: "#2a1450",
      onSurface: "#f6e9ff",
      accent: "#ff3fa4",
      onAccent: "#ffffff",
      pad: "#2b1550",
      onPad: "#7ef9ff",
      muted: "#a98fd6",
      ok: "#5dffb0",
      bad: "#ff5c7a",
    },
    radius: 6,
    uppercase: true,
  },
  "boombox-90s": {
    id: "boombox-90s",
    name: "Boombox",
    font: "grotesk",
    colors: {
      bg: "#2d1a5c",
      onBg: "#f3f0ff",
      surface: "#3d2780",
      onSurface: "#f3f0ff",
      accent: "#2be0c9",
      onAccent: "#10123a",
      pad: "#3a2478",
      onPad: "#f3f0ff",
      muted: "#a99be0",
      ok: "#5dffb0",
      bad: "#ff6b81",
    },
    radius: 18,
    uppercase: true,
  },
  "cinema-marquee": {
    id: "cinema-marquee",
    name: "Kino",
    font: "grotesk",
    colors: {
      bg: "#101a33",
      onBg: "#fff3d6",
      surface: "#fff3d6",
      onSurface: "#101a33",
      accent: "#f5c242",
      onAccent: "#101a33",
      pad: "#1b2a50",
      onPad: "#fff3d6",
      muted: "#93a2c8",
      ok: "#7be0a0",
      bad: "#ff7a7a",
    },
    radius: 14,
    uppercase: false,
  },
  "cinema-curtain": {
    id: "cinema-curtain",
    name: "Kino Vorhang",
    font: "grotesk",
    colors: {
      bg: "#3a0b14",
      onBg: "#ffe9ec",
      surface: "#f1e6e8",
      onSurface: "#3a0b14",
      accent: "#d8d9e2",
      onAccent: "#3a0b14",
      pad: "#561522",
      onPad: "#ffe9ec",
      muted: "#c595a0",
      ok: "#7be0a0",
      bad: "#ff9a8a",
    },
    radius: 14,
    uppercase: false,
  },
  "arcade-gamepad": {
    id: "arcade-gamepad",
    name: "Controller",
    font: "pixel",
    colors: {
      bg: "#161636",
      onBg: "#f2f2ff",
      surface: "#26265a",
      onSurface: "#f2f2ff",
      accent: "#ffd23f",
      onAccent: "#161636",
      pad: "#22224f",
      onPad: "#f2f2ff",
      muted: "#8d8dc9",
      ok: "#5fe08a",
      bad: "#ff5d73",
    },
    radius: 4,
    uppercase: true,
  },
  "grindhouse-film": {
    id: "grindhouse-film",
    name: "Grindhouse",
    font: "mono",
    colors: {
      bg: "#e2b007",
      onBg: "#140c06",
      surface: "#140c06",
      onSurface: "#f6e7b8",
      accent: "#b3121a",
      onAccent: "#f6e7b8",
      pad: "#cf9d03",
      onPad: "#140c06",
      muted: "#6f5200",
      ok: "#1f7a3c",
      bad: "#b3121a",
    },
    radius: 2,
    uppercase: true,
  },
  "pipboy-radio": {
    id: "pipboy-radio",
    name: "Wasteland-Radio",
    font: "mono",
    colors: {
      bg: "#06150b",
      onBg: "#5dff8a",
      surface: "#0c2a15",
      onSurface: "#5dff8a",
      accent: "#5dff8a",
      onAccent: "#06150b",
      pad: "#0a2112",
      onPad: "#5dff8a",
      muted: "#2f9a52",
      ok: "#b6ff6b",
      bad: "#ff8a4c",
    },
    radius: 8,
    uppercase: true,
  },
};

export const DEFAULT_THEME: ThemeId = "turntable-orange";

export function themeFor(pool?: Pool): Theme {
  return THEMES[pool?.theme ?? DEFAULT_THEME];
}

export function themeVars(theme: Theme): Record<string, string> {
  const c = theme.colors;
  return {
    "--t-bg": c.bg,
    "--t-on-bg": c.onBg,
    "--t-surface": c.surface,
    "--t-on-surface": c.onSurface,
    "--t-accent": c.accent,
    "--t-on-accent": c.onAccent,
    "--t-pad": c.pad,
    "--t-on-pad": c.onPad,
    "--t-muted": c.muted,
    "--t-ok": c.ok,
    "--t-bad": c.bad,
    "--t-radius": `${theme.radius}px`,
    "--t-font": `var(--font-t-${theme.font})`,
    "--t-upper": theme.uppercase ? "uppercase" : "none",
  };
}
