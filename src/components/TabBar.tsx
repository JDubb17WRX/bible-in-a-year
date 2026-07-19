"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Today", shape: "circle" as const, size: 18 },
  { href: "/calendar", label: "Calendar", shape: "square" as const, size: 18 },
  { href: "/profile", label: "Profile", shape: "circle" as const, size: 14 },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="tab-bar">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link key={tab.href} href={tab.href} className={`tab-bar-item${active ? " active" : ""}`}>
            <span
              className="tab-bar-dot"
              style={{
                width: tab.size,
                height: tab.size,
                borderRadius: tab.shape === "circle" ? "50%" : 5,
              }}
            />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
