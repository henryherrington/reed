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
    <nav className="flex gap-5 flex-1 items-center">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`text-sm font-medium ${active ? "text-ink" : "text-ink/60 hover:text-ink"}`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
