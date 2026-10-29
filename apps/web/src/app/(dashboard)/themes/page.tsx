import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/placeholder-page";
import { defaultTheme } from "@/features/themes/config";

export const metadata: Metadata = { title: "Temáticas" };

export default function ThemesPage() {
  return <PlaceholderPage title="Temáticas" description={`Temática predeterminada: ${defaultTheme.name}. Más adelante se incorporarán Kawaii, Gamer y Premium.`} />;
}
