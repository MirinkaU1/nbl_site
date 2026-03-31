import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Barlow_Condensed, DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-barlow-cond",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NBL — National Basketball Leaders",
  description:
    "Le premier tournoi de street basketball 5v5 d'Abidjan. Compétition, culture, communauté.",
};

export const viewport: Viewport = {
  themeColor: "#0F0F0F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${bebasNeue.variable} ${barlowCondensed.variable} ${dmSans.variable} font-sans antialiased bg-nbl-bg text-nbl-white`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
