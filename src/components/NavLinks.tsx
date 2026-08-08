"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Home" },
  { href: "/activity", label: "Activity" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 flex-1">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${active ? "text-ink" : "text-ink/60 hover:text-ink"}`}
            style={active ? { boxShadow: "inset 0 -2px 0 #b5502f", fontWeight: 600 } : undefined}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
