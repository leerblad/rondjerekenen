import type { Metadata } from "next";
import { Outfit, DM_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rondje Rekenen — dagelijks rekenen oefenen voor de bovenbouw",
  description:
    "Laat leerlingen in groep 4 t/m 8 elke dag in 10 minuten rekenen oefenen. Automatisch op het juiste niveau, met inzicht voor de leerkracht. Gratis proberen.",
  keywords: [
    "rekenen oefenen bovenbouw",
    "rekenen groep 5",
    "rekenen groep 6",
    "rekenen groep 7",
    "rekenen groep 8",
    "tafels oefenen",
    "automatiseren rekenen",
    "rekenen basisschool",
    "dagelijks rekenen",
    "rekenprogramma bovenbouw",
  ],
  openGraph: {
    title: "Rondje Rekenen — dagelijks rekenen oefenen voor de bovenbouw",
    description:
      "Elke dag een rondje rekenen. Klaar in 10 minuten. Voor groep 4 t/m 8.",
    url: "https://www.rondjerekenen.nl",
    siteName: "Rondje Rekenen",
    locale: "nl_NL",
    type: "website",
    images: [{ url: "https://www.rondjerekenen.nl/Rekenenlogo.jpg", width: 1200, height: 630 }],
  },
  verification: { google: "WYGrVOQB4daY4yvPH0zJU40BKOhXJjBL1vnHCi6o9d0" },
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${outfit.variable} ${dmMono.variable}`}>
      <body className="min-h-screen antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
