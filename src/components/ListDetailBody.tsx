"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateList, deleteList, addItemToList, removeItemFromList, searchMyLibraryItems, toggleRead } from "@/app/actions";
import { posterColor } from "@/lib/posterColor";
import SaveListButton from "./SaveListButton";
import BookStatusIcon from "./BookStatusIcon";

type ListItemRow = {
  id: string;
  note: string | null;
  read: boolean;
  entryId?: string;
  item: { id: string; title: string; url: string; source: string };
};

type SearchResult = { id: string; title: string; source: string };

export default function ListDetailBody({
  list,
  items,
  isOwn,
  isSaved,
  ownerUsername,
  savesCount,
  listsHref,
  startInEditing,
}: {
  list: { id: string; title: string; description: string | null; public: boolean };
  items: ListItemRow[];
  isOwn: boolean;
  isSaved: boolean;
  ownerUsername: string | null;
  savesCount: number;
  listsHref: string;
  startInEditing?: boolean;
}) {
  const [, startTransition] = useTransition();
  const router = useRouter();

  const [editing, setEditing] = useState(!!startInEditing && isOwn);
  const [title, setTitle] = useState(list.title);
  const [description, setDescription] = useState(list.description || "");
  const [isPublic, setIsPublic] = useState(list.public);
  const [saving, setSaving] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        setResults(await searchMyLibraryItems(value));
      } catch {
        setResults([]);
      }
    }, 300);
  }

  function addItem(itemId: string) {
    startTransition(async () => {
      try {
        await addItemToList(list.id, itemId);
        setQuery("");
        setResults([]);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function handleReadToggle(e: React.MouseEvent, entryId: string) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      try {
        await toggleRead(entryId);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function removeItem(itemId: string) {
    startTransition(async () => {
      try {
        await removeItemFromList(list.id, itemId);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  async function saveEdit() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await updateList(list.id, { title, description, public: isPublic });
      setEditing(false);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
    setSaving(false);
  }

  function cancelEdit() {
    setTitle(list.title);
    setDescription(list.description || "");
    setIsPublic(list.public);
    setEditing(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this list? This can't be undone.")) return;
    try {
      await deleteList(list.id);
      router.push(listsHref);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const existingIds = new Set(items.map((i) => i.item.id));

  return (
    <div>
      <Link href={listsHref} className="text-sm text-ink/40 hover:text-ink mb-3.5 inline-block">
        ← Lists
      </Link>

      {editing ? (
        <div className="mb-8">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="List title"
            className="w-full font-serif text-2xl font-semibold mb-3 px-0 py-1 bg-transparent border-0 border-b focus:outline-none"
            style={{ borderColor: "var(--line)" }}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this list about? Write as much as you'd like — this is the place to lay out your thinking."
            rows={7}
            className="w-full px-3 py-2.5 rounded-lg border text-[15px] leading-relaxed resize-none mb-3"
            style={{ borderColor: "var(--line)" }}
          />
          <label className="flex items-center gap-2 text-sm text-ink/60 mb-5">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            Public — visible on your profile
          </label>
          <div className="flex items-center gap-2.5">
            <button onClick={saveEdit} disabled={saving || !title.trim()} className="px-4 py-2 rounded-lg text-sm bg-ink text-white">
              Save
            </button>
            <button onClick={cancelEdit} className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--line)" }}>
              Cancel
            </button>
            <button onClick={handleDelete} className="ml-auto text-sm text-ink/40 hover:text-ink underline">
              Delete list
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="font-serif text-2xl font-semibold m-0">{list.title}</h1>
            {isOwn ? (
              <button onClick={() => setEditing(true)} className="text-sm text-accent underline shrink-0">
                Edit
              </button>
            ) : (
              <div className="shrink-0">
                <SaveListButton listId={list.id} initialSaved={isSaved} />
              </div>
            )}
          </div>

          {list.description ? (
            <p className="text-[15px] text-ink/70 mb-3 whitespace-pre-wrap">{list.description}</p>
          ) : (
            isOwn && (
              <button onClick={() => setEditing(true)} className="text-sm text-ink/40 hover:text-ink underline mb-3">
                Add a description
              </button>
            )
          )}

          <div className="text-xs text-ink/40 mb-8">
            {ownerUsername && !isOwn ? `${ownerUsername} · ` : ""}
            {items.length} item{items.length === 1 ? "" : "s"}
            {savesCount > 0 ? ` · saved by ${savesCount}` : ""}
            {isOwn && !list.public ? " · private" : ""}
          </div>
        </>
      )}

      {isOwn && (
        <div className="mb-6 relative">
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Add from your library..."
            className="w-full px-3 py-2 rounded-lg border text-sm bg-white"
            style={{ borderColor: "var(--line)" }}
          />
          {query.trim() && (
            <div
              className="absolute top-full left-0 mt-1.5 w-full bg-white rounded-xl p-2 z-20"
              style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.1), inset 0 0 0 1px var(--line)" }}
            >
              {results.length === 0 && <p className="text-sm text-ink/40 px-2 py-1.5">No matches in your library.</p>}
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => addItem(r.id)}
                  disabled={existingIds.has(r.id)}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-bg text-sm disabled:text-ink/30"
                >
                  {r.title} <span className="text-ink/40">· {existingIds.has(r.id) ? "already in list" : r.source}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-ink/40">No items yet.</p>
      ) : (
        <div>
          {items.map((li) => (
            <div
              key={li.id}
              className="flex items-center gap-3 py-3 border-b"
              style={{ borderColor: "var(--line)" }}
            >
              <div className="w-9 h-9 rounded shrink-0" style={{ background: posterColor(li.item.id) }} />
              <Link href={`/book/${li.item.id}`} className="min-w-0 flex-1 hover:text-accent">
                <p className="text-sm font-medium truncate m-0">{li.item.title}</p>
                {li.note ? (
                  <p className="text-xs text-ink/50 mt-0.5 line-clamp-1">{li.note}</p>
                ) : (
                  <p className="text-xs text-ink/30 mt-0.5">{li.item.source}</p>
                )}
              </Link>
              {li.entryId && (
                <button
                  onClick={(e) => handleReadToggle(e, li.entryId as string)}
                  aria-label={li.read ? "Mark as unread" : "Mark as read"}
                  title={li.read ? "Read" : "Mark as read"}
                  className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0"
                  style={{ color: li.read ? "#20201d" : "#8c8a80", boxShadow: "inset 0 0 0 1px var(--line)" }}
                >
                  <BookStatusIcon read={li.read} width={13} height={13} />
                </button>
              )}
              {isOwn && (
                <button
                  onClick={() => removeItem(li.item.id)}
                  aria-label="Remove from list"
                  className="text-ink/30 hover:text-ink text-sm shrink-0 px-1"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
