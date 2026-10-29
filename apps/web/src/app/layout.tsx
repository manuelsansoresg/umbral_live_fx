import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { defaultTheme } from "@/features/themes/config";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Umbral LIVE FX", template: "%s | Umbral LIVE FX" },
  description: "La base de tu próxima experiencia interactiva en LIVE.",
  robots: { index: false, follow: false },
};

const brandStyles = {
  "--brand-primary": defaultTheme.palette.primary,
  "--brand-white": defaultTheme.palette.foreground,
  "--brand-black": defaultTheme.palette.background,
  "--brand-gray": defaultTheme.palette.secondary,
} as CSSProperties;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" style={brandStyles}>
      <body>{children}</body>
    </html>
  );
}
