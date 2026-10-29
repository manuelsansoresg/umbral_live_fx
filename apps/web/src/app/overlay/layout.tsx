import type { Metadata } from "next";

export const metadata: Metadata = { title: "Overlay" };

export default function OverlayLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div id="overlay-root" className="min-h-dvh bg-transparent">{children}</div>;
}
