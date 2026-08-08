"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleRead, addToLibrary } from "@/app/actions";
import { posterColor } from "@/lib/posterColor";

type Item = { id: string; title: string; url: string; source: string };
type Entry = {
  id: string;
  read: boolean;
  rating: number | null;
  reviewText: string | null;
};

function OpenEyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function ClosedEyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12.5c3 3 6.5 4.5 10 4.5s7-1.5 10-4.5" />
      <path d="M7 16.5l-1.2 2M12 17.5v2.2M17 16.5l1.2 2" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export default function BookHero({ item, yourEntry }: { item: Item; yourEntry: Entry | null }) {
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const color = posterColor(item.id);

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

  return (
    <div className="shrink-0">
      <div className="relative rounded-md overflow-hidden" style={{ background: color, width: 110, aspectRatio: "5/7" }}>
        {yourEntry && (
          <div className="absolute top-1.5 right-1.5 flex gap-1">
            <button
              onClick={handleToggleRead}
              disabled={busy}
              aria-label={yourEntry.read ? "Mark as unread" : "Mark as read"}
              className="w-7 h-7 rounded-full bg-white/85 flex items-center justify-center"
              style={{ color: yourEntry.read ? "#3f6b4a" : "#8c8a80" }}
            >
              {yourEntry.read ? <OpenEyeIcon /> : <ClosedEyeIcon />}
            </button>
            <Link
              href={`/review/${yourEntry.id}`}
              aria-label={yourEntry.rating != null ? "View or edit your review" : "Write a review"}
              className="w-7 h-7 rounded-full bg-white/85 flex items-center justify-center"
              style={{ color: yourEntry.rating != null ? "#b5502f" : "#8c8a80" }}
            >
              <CommentIcon />
            </Link>
          </div>
        )}
      </div>
      {!yourEntry && (
        <button onClick={handleAdd} disabled={busy} className="mt-3 px-4 py-2 rounded-lg bg-ink text-white text-sm font-medium whitespace-nowrap">
          + Add to your library
        </button>
      )}
    </div>
  );
}
