import { Poppins } from "next/font/google";

import "./globals.css";

import type { Metadata } from "next";

import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./lib/auth/auth.context";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
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
      <body className={`${poppins.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#030207',
              color: '#fff',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'var(--font-poppins), system-ui, sans-serif',
              boxShadow: '0 16px 32px -8px rgba(31,31,31,0.25)',
            },
            success: {
              iconTheme: { primary: '#C6F432', secondary: '#030207' },
            },
            error: {
              iconTheme: { primary: '#F2685C', secondary: '#030207' },
            },
          }}
        />
      </body>
    </html>
  );
}