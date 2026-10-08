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
