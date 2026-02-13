import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pegasus MRX",
  description: "Premium Digital Products",
};

import { CartProvider } from "@/context/CartContext";
import { PageViewTracker } from "@/components/PageViewTracker";
import { TelegramWidget } from "@/components/TelegramWidget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <CartProvider>
          <PageViewTracker />
          {children}
          <TelegramWidget />
        </CartProvider>
      </body>
    </html>
  );
}
