import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { Providers } from "@/providers/Providers";
import { Toaster } from 'react-hot-toast';
import NavBar from "@/components/NavBar";
import AnnouncementBar from "@/components/AnnouncementBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trip And Tidy | Smart Things for Everyday Life",
  description: "Discover smart, stylish, and practical essentials for everyday living. Trip And Tidy brings you thoughtfully curated products designed to simplify and elevate your daily life.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
      >
        <Providers>
          <AnnouncementBar />
          <NavBar />
          <main className="min-h-[calc(100vh-64px)]">
            {children}
          </main>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
