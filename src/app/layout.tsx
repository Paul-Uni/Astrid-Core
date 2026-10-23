import type { Metadata, Viewport } from "next";
import { Pixelify_Sans, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const pixelify = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-pixelify-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Astrid-Core — Paul Onyeikedi",
  description:
    "Paul Onyeikedi — C#/.NET developer and CS student at Ruhr-Universität Bochum. Open to Werkstudent roles.",
  metadataBase: new URL("https://astridcore.dev"),
  openGraph: {
    title: "Astrid-Core — Paul Onyeikedi",
    description:
      "Paul Onyeikedi — C#/.NET developer and CS student at Ruhr-Universität Bochum.",
    url: "https://astridcore.dev",
    siteName: "Astrid-Core",
    locale: "en_US",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#070A1F",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  // Explicitly do NOT set maximum-scale or user-scalable=no.
  // Native pinch/CTRL zoom must work (contract from the plan).
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${pixelify.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
