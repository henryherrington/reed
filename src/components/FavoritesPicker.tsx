"use client";

import { useState } from "react";
import { togglePin } from "@/app/actions";

type Entry = { id: string; pinned: boolean; item: { title: string } };

export default function FavoritesPicker({ entries }: { entries: Entry[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);

  const pinnedCount = entries.filter((e) => e.pinned).length;
  const filtered = entries.filter((e) => e.item.title.toLowerCase().includes(query.toLowerCase()));

  async function toggle(id: string) {
    setBusy(true);
    try {
      await togglePin(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
    setBusy(false);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-sm text-accent underline">
        Choose your favorites ({pinnedCount}/4)
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl p-7 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Choose your favorites</h2>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search what you've read..."
              className="w-full px-3 py-2 rounded-lg border text-sm mb-3"
              style={{ borderColor: "var(--line)" }}
            />
            <div className="max-h-64 overflow-y-auto -mx-1 px-1">
              {filtered.length === 0 && <p className="text-sm text-ink/40 py-2">Nothing marked read yet.</p>}
              {filtered.map((e) => (
                <label key={e.id} className="flex items-center justify-between gap-3 py-2 px-2 rounded-lg hover:bg-bg cursor-pointer">
                  <span className="text-sm truncate">{e.item.title}</span>
                  <input
                    type="checkbox"
                    checked={e.pinned}
                    disabled={busy || (!e.pinned && pinnedCount >= 4)}
                    onChange={() => toggle(e.id)}
                  />
                </label>
              ))}
            </div>
            <div className="flex justify-end mt-5">
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--line)" }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
