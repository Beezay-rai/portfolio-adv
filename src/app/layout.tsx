import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import { getSiteSettings } from "@/lib/queries";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-body" });

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  const metadata: Metadata = {
    metadataBase: new URL(settings.url),
    title: {
      default: `${settings.name} – ${settings.role}`,
      template: `%s – ${settings.name}`,
    },
    description: settings.tagline,
  };

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        <meta name="theme-color" content="#2F4BFF" />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
