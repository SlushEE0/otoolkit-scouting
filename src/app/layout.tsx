import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import NavbarTip from "@/components/NavbarTip";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"]
// });

export const metadata: Metadata = {
  title: "Optix Toolkit",
  description: "DNHS Team Optix 3749"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={"dark"}>
        <main className={`w-full ${geistSans.className} antialiased`}>
          <Navbar />
          <NavbarTip />
          <Toaster />
          {children}
        </main>
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
