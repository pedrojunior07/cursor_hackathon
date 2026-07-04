import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rota Segura MZ — MVP",
  description:
    "Evacuação em cheias: mapa, abrigos, rotas seguras, USSD e SMS para Moçambique.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
