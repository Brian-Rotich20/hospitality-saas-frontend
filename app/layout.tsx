import localFont from "next/font/local";

import "./globals.css";

import type { Metadata } from "next";

import { Toaster } from "react-hot-toast";
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
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1A2820',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              fontFamily: 'DM Sans, system-ui, sans-serif',
            },
            success: {
              iconTheme: { primary: '#D4ED47', secondary: '#0F1A14' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  );
}