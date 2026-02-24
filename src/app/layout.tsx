import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BaseLayout } from "@/components/layout/BaseLayout";
import { Navbar } from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Madness | The Ultimate Draft Pool",
  description: "Join the Madness Draft and compete with your friends.",
  openGraph: {
    title: "Madness",
    description: "The ultimate tournament draft experience.",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Madness",
    description: "The ultimate tournament draft experience.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <div className="min-h-screen bg-brand-light flex flex-col font-sans">
          <Navbar />
          <main className="flex-grow container mx-auto p-4 md:p-6">
            {children}
          </main>
          <footer className="bg-brand-dark text-white p-4 text-center text-sm">
            &copy; 2026 Madness Draft Pool
          </footer>
        </div>
      </body>
    </html>
  );
}
