import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
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
        <SidebarProvider defaultOpen={false}>
          <AppSidebar />
          <SidebarInset>
            <header className="sticky top-0 z-40 flex h-12 items-center gap-2 border-b bg-background/80 backdrop-blur-sm px-4">
              <SidebarTrigger className="-ml-1" />
            </header>
            <main className="w-full font-sans antialiased">
              <ServiceWorkerRegistrar />
              <Toaster />
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
