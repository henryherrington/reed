"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function SortSelect({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === "recent") params.delete("sort");
    else params.set("sort", e.target.value);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <select
      value={current}
      onChange={onChange}
      className="px-2.5 py-1.5 rounded-lg border text-xs text-ink/70 bg-white"
      style={{ borderColor: "var(--line)" }}
    >
      <option value="recent">Recently added</option>
      <option value="rating">Top rated</option>
    </select>
  );
}
