"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { globalSearch } from "@/app/actions";

type UserResult = { id: string; name: string | null; username: string | null };
type ItemResult = { id: string; title: string; source: string };

export default function SearchBar() {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserResult[]>([]);
  const [items, setItems] = useState<ItemResult[]>([]);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) collapse();
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function expand() {
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function collapse() {
    setExpanded(false);
    setQuery("");
    setUsers([]);
    setItems([]);
  }

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
    collapse();
    router.push(href);
  }

  const hasResults = users.length > 0 || items.length > 0;

  return (
    <div ref={boxRef} className="relative flex items-center">
      {expanded ? (
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && collapse()}
          className="w-56 px-3 py-1.5 rounded-lg border text-sm bg-white"
          style={{ borderColor: "var(--line)" }}
        />
      ) : (
        <button
          onClick={expand}
          aria-label="Search"
          className="w-8 h-8 flex items-center justify-center rounded-full text-ink/50 hover:text-ink hover:bg-white"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
        </button>
      )}

      {expanded && query.trim() && (
        <div
          className="absolute top-full right-0 mt-1.5 w-64 bg-white rounded-xl p-2 z-30"
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
