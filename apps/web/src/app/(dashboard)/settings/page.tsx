import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/placeholder-page";

export const metadata: Metadata = { title: "Configuración" };

export default function SettingsPage() {
  return <PlaceholderPage title="Configuración" description="Aquí se prepararán las preferencias generales y las opciones de conexión con TikTok." />;
}
