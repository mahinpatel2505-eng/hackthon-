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
  title: "CoreInventory — Real-Time Inventory Dashboard",
  description: "Enterprise-grade inventory management system with real-time stock tracking, receipts, deliveries, transfers, and adjustments.",
};

import { Sidebar } from "@/components/layout/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen bg-background text-foreground">
          <Sidebar />
          <div className="flex-1 md:ml-64 transition-all duration-300">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
