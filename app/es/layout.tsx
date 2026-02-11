// app/es/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wave Sync — Sincroniza Spotify y YouTube Music",
  description:
    "Transfiere tus listas entre Spotify y YouTube Music en ambas direcciones. Sincronización gratuita para tu música.",
};

export default function EsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}