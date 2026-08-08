"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addItem, addToLibrary, searchItems } from "@/app/actions";

type Result = { id: string; title: string; source: string; url: string };

function looksLikeUrl(s: string) {
  return /^https?:\/\//i.test(s.trim());
}

export default function AddSearch({ myItemIds }: { myItemIds: string[] }) {
  const [mode, setMode] = useState<"search" | "create">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [searched, setSearched] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inLibrary = new Set(myItemIds);

  function onQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        setResults(await searchItems(value));
      } catch {
        setResults([]);
      }
      setSearched(true);
    }, 300);
  }

  async function handleAddExisting(itemId: string) {
    setSaving(itemId);
    try {
      await addToLibrary(itemId);
      router.push(`/book/${itemId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
      setSaving(null);
    }
  }

  async function handleCreate() {
    if (!title.trim() || !url.trim()) {
      alert("Add a title and a link.");
      return;
    }
    setSaving("new");
    try {
      const item = await addItem(title.trim(), url.trim());
      router.push(`/book/${item.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
      setSaving(null);
    }
  }

  function startCreate() {
    if (looksLikeUrl(query)) {
      setUrl(query.trim());
      setTitle("");
    } else {
      setTitle(query.trim());
      setUrl("");
    }
    setMode("create");
  }

  if (mode === "create") {
    return (
      <div className="max-w-lg">
        <button onClick={() => setMode("search")} className="text-sm text-ink/40 hover:text-ink mb-3.5 inline-block">
          ← Back to search
        </button>
        <h1 className="font-serif text-2xl font-semibold mb-1">Add something new</h1>
        <p className="text-ink/50 mb-6">Give it a title and a link, and it&apos;ll be waiting in your library.</p>

        <label className="block text-xs font-medium text-ink/60 mb-1">Title</label>
        <input
          autoFocus={!title}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Attention Is All You Need"
          className="w-full px-3 py-2.5 rounded-lg border text-sm mb-4"
          style={{ borderColor: "var(--line)" }}
        />

        <label className="block text-xs font-medium text-ink/60 mb-1">Link</label>
        <input
          autoFocus={!!title && !url}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2.5 rounded-lg border text-sm mb-6"
          style={{ borderColor: "var(--line)" }}
        />

        <button onClick={handleCreate} disabled={saving === "new"} className="px-4 py-2 rounded-lg text-sm bg-ink text-white font-medium">
          Add to your library
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-serif text-2xl font-semibold mb-1">Add something to read</h1>
      <p className="text-ink/50 mb-6">Search by title, or paste a link.</p>

      <input
        autoFocus
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search or paste a URL..."
        className="w-full px-4 py-3 rounded-xl border text-[15px] mb-6 bg-white"
        style={{ borderColor: "var(--line)" }}
      />

      {query.trim() && (
        <div className="mb-6">
          {results.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-3 py-3 border-b"
              style={{ borderColor: "var(--line)" }}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{r.title}</p>
                <p className="text-xs text-ink/40 truncate">{r.source}</p>
              </div>
              {inLibrary.has(r.id) ? (
                <span className="text-xs text-ink/40 shrink-0">In your library</span>
              ) : (
                <button
                  onClick={() => handleAddExisting(r.id)}
                  disabled={saving === r.id}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-xs border"
                  style={{ borderColor: "var(--line)" }}
                >
                  Add
                </button>
              )}
            </div>
          ))}
          {searched && results.length === 0 && <p className="text-sm text-ink/40 py-2">No matches for &quot;{query}&quot;.</p>}
        </div>
      )}

      {query.trim() && (
        <button
          onClick={startCreate}
          className="w-full text-left flex items-center gap-3 py-3 px-3 rounded-lg border border-dashed hover:bg-white"
          style={{ borderColor: "var(--line)" }}
        >
          <span className="text-lg text-ink/40">+</span>
          <span className="text-sm text-ink/70">
            Can&apos;t find it? Add <span className="font-medium">&quot;{query}&quot;</span> as something new
          </span>
        </button>
      )}
    </div>
  );
}
