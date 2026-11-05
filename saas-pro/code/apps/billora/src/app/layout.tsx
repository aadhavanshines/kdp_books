import { Toaster } from "@saas/ui";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({ src: "./fonts/inter-latin-wght-normal.woff2", variable: "--font-inter", display: "swap", weight: "100 900" });

export const metadata: Metadata = {
  title: { default: "Billora: invoicing and getting paid", template: "%s · Billora" },
  description: "GST-ready invoices for freelancers and small Indian businesses.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121a1d" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" data-brand="billora" className={inter.variable}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
