"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { globalSearch } from "@/app/actions";

type UserResult = { id: string; name: string | null; username: string | null };
type ItemResult = { id: string; title: string; source: string };

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserResult[]>([]);
  const [items, setItems] = useState<ItemResult[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function onQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setUsers([]);
      setItems([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await globalSearch(value);
        setUsers(res.users);
        setItems(res.items);
      } catch {
        setUsers([]);
        setItems([]);
      }
    }, 250);
  }

  function go(href: string) {
    setOpen(false);
    setQuery("");
    setUsers([]);
    setItems([]);
    router.push(href);
  }

  const hasResults = users.length > 0 || items.length > 0;

  return (
    <div ref={boxRef} className="relative flex-1 max-w-xs">
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Search people or articles"
        className="w-full px-3 py-1.5 rounded-lg border text-sm bg-white"
        style={{ borderColor: "var(--line)" }}
      />
      {open && query.trim() && (
        <div
          className="absolute top-full left-0 mt-1.5 w-full min-w-[280px] bg-white rounded-xl p-2 z-30"
          style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.1), inset 0 0 0 1px var(--line)" }}
        >
          {!hasResults && <p className="text-sm text-ink/40 px-2 py-1.5">No matches.</p>}
          {users.length > 0 && (
            <div className="mb-1.5">
              <p className="text-[10px] uppercase tracking-wide text-ink/40 font-semibold px-2 mb-1">People</p>
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => go(`/u/${u.username}`)}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-bg text-sm"
                >
                  {u.name} <span className="text-ink/40 underline">{u.username}</span>
                </button>
              ))}
            </div>
          )}
          {items.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-ink/40 font-semibold px-2 mb-1">Articles</p>
              {items.map((it) => (
                <button
                  key={it.id}
                  onClick={() => go(`/book/${it.id}`)}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-bg text-sm truncate"
                >
                  {it.title} <span className="text-ink/40">· {it.source}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
