"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Home,
  SearchCode,
  Clock,
  Settings,
  Wrench,
  QrCode
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { label: "Home", url: "/", icon: Home },
  { label: "Responses", url: "/responses", icon: SearchCode },
  { label: "Export", url: "/export", icon: Clock },
  { label: "Configure", url: "/configure", icon: Wrench },
  { label: "Settings", url: "/settings", icon: Settings }
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="p-3">
        <Link href="/" className="flex items-center gap-2 px-1">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
            O
          </div>
          <span className="text-sm font-semibold truncate group-data-[collapsible=icon]:hidden">
            OToolkit
          </span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.url === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}>
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Import</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/scan"}
                  tooltip="Scan QR Config">
                  <Link href="/scan">
                    <QrCode className="size-4" />
                    <span>Scan QR Config</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <p className="text-[10px] text-muted-foreground truncate group-data-[collapsible=icon]:hidden">
          Optix 3749 Scouting
        </p>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
