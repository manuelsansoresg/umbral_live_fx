import type { ThemeDefinition } from "@umbral/shared";

export const defaultTheme = {
  id: "terror",
  name: "Terror / UmbralCreepy",
  palette: {
    primary: "#B81313",
    background: "#111111",
    foreground: "#FFFFFF",
    secondary: "#555555",
  },
  assetsBasePath: "/images/themes/terror",
} as const satisfies ThemeDefinition;
