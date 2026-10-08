import type { CSSProperties } from "react";
import type { Theme } from "@/lib/themes";
import { themeVars } from "@/lib/themes";

export function ThemeScope({
  theme,
  children,
  className = "",
}: {
  theme: Theme;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`tscope ${className}`} style={themeVars(theme) as CSSProperties} data-theme={theme.id}>
      {children}
    </div>
  );
}
