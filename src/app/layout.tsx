import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "./providers";

const inter = Inter({subsets:['latin'],variable:'--font-inter-fallback'});

const kufi = Noto_Kufi_Arabic({
  variable: "--font-kufi",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
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
  themeColor: "#2A1238",
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
      className={cn("h-full", "antialiased", kufi.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col"> <Providers>{children}</Providers></body>
    </html>
  );
}
