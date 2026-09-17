import localFont from "next/font/local";

import "./globals.css";

import type { Metadata } from "next";

import { AuthProvider } from "./lib/auth/auth.context";

const satoshi = localFont({
  src: "../public/fonts/Satoshi.ttf",
  variable: "--font-satoshi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LinkMart",
  description:
    "Discover and book verified venues, caterers and hospitality vendors across Kenya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${satoshi.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}