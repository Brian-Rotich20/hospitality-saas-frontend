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
    "Find venues, caterers and event services in Kenya and request to book. You pay the vendor directly.",
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
              background: '#1F1F1F',
              color: '#fff',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'var(--font-satoshi), system-ui, sans-serif',
              boxShadow: '0 16px 32px -8px rgba(31,31,31,0.25)',
            },
            success: {
              iconTheme: { primary: '#3FB97A', secondary: '#1F1F1F' },
            },
            error: {
              iconTheme: { primary: '#F2685C', secondary: '#1F1F1F' },
            },
          }}
        />
      </body>
    </html>
  );
}