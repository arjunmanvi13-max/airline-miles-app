import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vantara | Smarter Award Travel Search",
  description:
    "Find smarter ways to book flights with transferable credit card points.",
  applicationName: "Vantara",
  metadataBase: new URL("https://vantara.app"),
  openGraph: {
    title: "Vantara | Smarter Award Travel Search",
    description:
      "Compare award availability, transfer partners, taxes, seat counts, and booking strategies.",
    url: "https://vantara.app",
    siteName: "Vantara",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vantara | Smarter Award Travel Search",
    description:
      "Find smarter ways to book flights with transferable credit card points.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
