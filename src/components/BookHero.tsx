"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleRead, addToLibrary } from "@/app/actions";
import BookStatusIcon from "./BookStatusIcon";

type Item = { id: string; title: string; url: string; source: string };
type Entry = {
  id: string;
  read: boolean;
  rating: number | null;
  reviewText: string | null;
};

function CommentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export default function BookHero({ item, yourEntry }: { item: Item; yourEntry: Entry | null }) {
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  function handleAdd() {
    setBusy(true);
    startTransition(async () => {
      try {
        await addToLibrary(item.id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Something went wrong");
      }
      setBusy(false);
    });
  }

  function handleToggleRead() {
    if (!yourEntry) return;
    setBusy(true);
    startTransition(async () => {
      try {
        await toggleRead(yourEntry.id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Something went wrong");
      }
      setBusy(false);
    });
  }

  if (!yourEntry) {
    return (
      <button onClick={handleAdd} disabled={busy} className="px-4 py-2 rounded-lg bg-ink text-white text-sm font-medium">
        + Add to your library
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggleRead}
        disabled={busy}
        aria-label={yourEntry.read ? "Mark as unread" : "Mark as read"}
        className="w-10 h-10 rounded-lg border flex items-center justify-center"
        style={{
          borderColor: yourEntry.read ? "#3f6b4a" : "var(--line)",
          color: yourEntry.read ? "#3f6b4a" : "var(--ink)",
        }}
      >
        <BookStatusIcon read={yourEntry.read} />
      </button>
      <Link
        href={`/review/${yourEntry.id}`}
        aria-label={yourEntry.rating != null ? "View or edit your review" : "Write a review"}
        className="w-10 h-10 rounded-lg border flex items-center justify-center"
        style={{
          borderColor: yourEntry.rating != null ? "#b5502f" : "var(--line)",
          color: yourEntry.rating != null ? "#b5502f" : "var(--ink)",
        }}
      >
        <CommentIcon />
      </Link>
    </div>
  );
}
