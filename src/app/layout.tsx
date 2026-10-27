import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { site } from "@/content/site";
import "./globals.css";

// Sora (OFL) stands in for Styrene A, the licensed typeface on hashgraph.com/clpr.
const sora = localFont({
  src: "./fonts/sora-latin-wght-normal.woff2",
  variable: "--font-sora",
  weight: "100 800",
  display: "swap",
});

const plexMono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: site.fullName,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: site.fullName,
    description: site.description,
    type: "website",
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: site.fullName,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#120f2c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sora.variable} ${plexMono.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
