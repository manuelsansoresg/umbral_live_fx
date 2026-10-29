export type ThemeId = "terror" | "kawaii" | "gamer" | "premium";

/** Visual configuration only; independent of rendering and streaming platforms. */
export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  palette: {
    primary: string;
    background: string;
    foreground: string;
    secondary: string;
  };
  assetsBasePath: string;
}
