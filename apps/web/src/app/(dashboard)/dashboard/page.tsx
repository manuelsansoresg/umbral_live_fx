import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/placeholder-page";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return <PlaceholderPage title="Dashboard" description="Aquí encontrarás el resumen de tu plataforma y de tus experiencias en LIVE." />;
}
