import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "./providers";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "لوحة التحكم — نظام إدارة الصالونات والحجوزات",
  description: "نظام متكامل لإدارة الصالونات والفروع والحجوزات والموظفين",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true, 
    statusBarStyle: "default",
    title: "لوحة التحكم",
  },
  icons: {
    icon: "/pwa-icon.svg",
    apple: "/pwa-icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // On Android Chrome the layout viewport shrinks when the keyboard opens,
  // so dvh-based bottom sheets stay above it instead of going underneath.
  interactiveWidget: "resizes-content",
  themeColor: "#E8192C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col"> <Providers>{children}</Providers></body>
    </html>
  );
}
