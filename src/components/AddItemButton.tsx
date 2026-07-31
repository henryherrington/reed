"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { addItem, addToLibrary, searchItems } from "@/app/actions";

type Result = { id: string; title: string; source: string; url: string };

export default function AddItemButton() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"search" | "create">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [searching, setSearching] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function reset() {
    setMode("search");
    setQuery("");
    setResults([]);
    setTitle("");
    setUrl("");
  }

  function close() {
    setOpen(false);
    reset();
  }

  function onQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await searchItems(value);
        setResults(r);
      } catch {
        setResults([]);
      }
      setSearching(false);
    }, 300);
  }

  async function handleAddExisting(itemId: string) {
    setSaving(true);
    try {
      await addToLibrary(itemId);
      close();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
    setSaving(false);
  }

  async function handleCreate() {
    if (!title.trim() || !url.trim()) {
      alert("Add a title and a link.");
      return;
    }
    setSaving(true);
    try {
      const item = await addItem(title.trim(), url.trim());
      close();
      router.push(`/book/${item.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
    setSaving(false);
  }

  function startCreate() {
    setMode("create");
    setTitle(query);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="px-4 py-2 rounded-lg bg-ink text-white text-sm font-medium">
        + Add
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5" onClick={close}>
          <div className="bg-white rounded-2xl p-7 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            {mode === "search" ? (
              <>
                <h2 className="text-lg font-semibold mb-4">Add to your library</h2>
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="Search by title..."
                  className="w-full px-3 py-2 rounded-lg border text-sm mb-3"
                  style={{ borderColor: "var(--line)" }}
                />
                {query.trim() && (
                  <div className="max-h-64 overflow-y-auto -mx-1 px-1 mb-2">
                    {results.map((r) => (
                      <div key={r.id} className="flex items-center justify-between gap-3 py-2 px-2 rounded-lg hover:bg-bg">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{r.title}</p>
                          <p className="text-xs text-ink/40 truncate">{r.source}</p>
                        </div>
                        <button
                          onClick={() => handleAddExisting(r.id)}
                          disabled={saving}
                          className="shrink-0 px-3 py-1.5 rounded-lg text-xs border"
                          style={{ borderColor: "var(--line)" }}
                        >
                          Add
                        </button>
                      </div>
                    ))}
                    {!searching && results.length === 0 && <p className="text-sm text-ink/40 py-2">No matches.</p>}
                  </div>
                )}
                <button onClick={startCreate} className="text-sm text-accent underline">
                  Can&apos;t find it? Add a new one
                </button>
                <div className="flex justify-end mt-5">
                  <button onClick={close} className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--line)" }}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold mb-4">Add a new one</h2>
                <div className="mb-3.5">
                  <label className="block text-xs font-medium text-ink/60 mb-1">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Attention Is All You Need"
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: "var(--line)" }}
                  />
                </div>
                <div className="mb-3.5">
                  <label className="block text-xs font-medium text-ink/60 mb-1">Link</label>
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: "var(--line)" }}
                  />
                </div>
                <div className="flex justify-between items-center mt-5">
                  <button onClick={() => setMode("search")} className="text-sm text-ink/50 hover:text-ink">
                    ← Back to search
                  </button>
                  <button onClick={handleCreate} disabled={saving} className="px-4 py-2 rounded-lg text-sm bg-ink text-white">
                    Add
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
