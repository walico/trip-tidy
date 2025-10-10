import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import "../globals.css";

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

export const metadata = {
  title: 'Account - Trip And Tidy',
  description: 'Sign in to your Trip And Tidy account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased h-full`}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
