"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfileTabs({ basePath }: { basePath: string }) {
  const pathname = usePathname();

  const tabs = [
    { href: basePath, label: "Overview" },
    { href: `${basePath}/shelf`, label: "Shelf" },
    { href: `${basePath}/lists`, label: "My Lists" },
  ];

  return (
    <nav className="flex gap-5 mb-6">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link key={t.href} href={t.href} className={`text-sm font-medium ${active ? "text-ink" : "text-ink/50 hover:text-ink"}`}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
