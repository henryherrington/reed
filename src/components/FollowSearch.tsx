"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { searchUsers, followUser, unfollow } from "@/app/actions";

type UserResult = { id: string; name: string | null; username: string | null };

export default function FollowSearch({ following }: { following: UserResult[] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const followingIds = new Set(following.map((f) => f.id));

  function onQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        setResults(await searchUsers(value));
      } catch {
        setResults([]);
      }
    }, 300);
  }

  async function handleFollow(id: string) {
    setBusy(true);
    try {
      await followUser(id);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
    setBusy(false);
  }

  async function handleUnfollow(id: string) {
    setBusy(true);
    try {
      await unfollow(id);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
    setBusy(false);
  }

  return (
    <div className="mb-6 p-4 rounded-xl bg-white" style={{ boxShadow: "inset 0 0 0 1px var(--line)" }}>
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Find people by username"
        className="w-full px-3 py-2 rounded-lg border text-sm mb-2"
        style={{ borderColor: "var(--line)" }}
      />
      {query.trim() && (
        <div className="mb-2">
          {results.map((u) => (
            <div key={u.id} className="flex items-center justify-between py-1.5">
              <span className="text-sm">
                {u.name} <span className="text-ink/40">{u.username}</span>
              </span>
              {followingIds.has(u.id) ? (
                <span className="text-xs text-ink/40">Following</span>
              ) : (
                <button
                  onClick={() => handleFollow(u.id)}
                  disabled={busy}
                  className="text-xs px-3 py-1 rounded-lg border"
                  style={{ borderColor: "var(--line)" }}
                >
                  Follow
                </button>
              )}
            </div>
          ))}
          {results.length === 0 && <p className="text-sm text-ink/40 py-1">No matches.</p>}
        </div>
      )}
      {following.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {following.map((f) => (
            <span
              key={f.id}
              className="text-xs px-2.5 py-1 rounded-full bg-bg flex items-center gap-1.5"
              style={{ boxShadow: "inset 0 0 0 1px var(--line)" }}
            >
              {f.username}
              <button onClick={() => handleUnfollow(f.id)} className="text-ink/40 hover:text-accent">
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      {following.length === 0 && !query.trim() && (
        <p className="text-xs text-ink/40 mt-1">Search for a friend's username to follow them.</p>
      )}
    </div>
  );
}
