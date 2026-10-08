import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Silkscreen, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const tGrotesk = Space_Grotesk({ variable: "--font-t-grotesk", subsets: ["latin"] });
const tMono = Space_Mono({ variable: "--font-t-mono", subsets: ["latin"], weight: ["400", "700"] });
const tPixel = Silkscreen({ variable: "--font-t-pixel", subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Who That Dome",
  description: "Musik-Quiz für den Tisch mit Spotify Premium",
};

export const viewport: Viewport = {
  themeColor: "#d7d7d7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} ${tGrotesk.variable} ${tMono.variable} ${tPixel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
