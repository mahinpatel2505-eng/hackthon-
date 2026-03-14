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

import { Providers } from "@/components/providers";
import { SidebarWrapper } from "@/components/layout/sidebar-wrapper";

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
        <Providers>
          <SidebarWrapper>
            {children}
          </SidebarWrapper>
        </Providers>
      </body>
    </html>
  );
}
