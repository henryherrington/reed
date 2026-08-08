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
            className={`text-sm pb-0.5 border-b-2 ${
              active ? "text-accent font-semibold border-accent" : "text-ink/60 font-medium border-transparent hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
