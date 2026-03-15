"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, Database, Settings } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/scout", label: "Scout", icon: ClipboardList },
  { href: "/entries", label: "Entries", icon: Database },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border flex"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center pt-2 pb-1 min-h-[44px] transition-colors ${
              active ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={22} />
            <span className="text-xs mt-0.5">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
