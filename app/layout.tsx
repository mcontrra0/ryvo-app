import type { Metadata } from "next";
import "@fontsource/bebas-neue";
import "./globals.css";

// NOTA: en este entorno de desarrollo el acceso a Google Fonts está
// bloqueado por la sandbox, así que usamos pilas de fuentes de sistema
// como fallback. En producción (Vercel) puedes restaurar next/font/google
// con Oswald + Inter + IBM Plex Mono — el código queda listo abajo, comentado.
//
// import { Oswald, Inter, IBM_Plex_Mono } from "next/font/google";
// const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["500","600","700"] });
// const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
// const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400","500","600"] });

export const metadata: Metadata = {
  title: "Ryvo — Fichaje y retención para tu gimnasio",
  description:
    "MVP de Ryvo: fichaje NFC/QR y Radar de Riesgo de baja para gimnasios independientes.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-podium-chalk text-podium-asphalt">
        {children}
      </body>
    </html>
  );
}
