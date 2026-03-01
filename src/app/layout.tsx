import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import NavbarTip from "@/components/NavbarTip";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

import "./globals.css";

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
        <main className="w-full font-sans antialiased">
          <ServiceWorkerRegistrar />
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
