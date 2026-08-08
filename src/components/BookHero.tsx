"use client";

import { useState, useTransition } from "react";
import { toggleRead, addToLibrary } from "@/app/actions";
import RateModal from "./RateModal";

type Item = { id: string; title: string; url: string; source: string };
type Entry = {
  id: string;
  read: boolean;
  rating: number | null;
  reviewText: string | null;
};

export default function BookHero({ item, yourEntry }: { item: Item; yourEntry: Entry | null }) {
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [showRate, setShowRate] = useState(false);

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
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={handleToggleRead}
        disabled={busy}
        className="px-4 py-2 rounded-lg text-sm font-medium border"
        style={{
          borderColor: yourEntry.read ? "#3f6b4a" : "var(--line)",
          color: yourEntry.read ? "#3f6b4a" : "var(--ink)",
        }}
      >
        {yourEntry.read ? "✓ Read" : "Mark as read"}
      </button>

      {yourEntry.read && yourEntry.rating == null && (
        <button onClick={() => setShowRate(true)} className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: "var(--line)" }}>
          Rate it
        </button>
      )}

      {showRate && (
        <RateModal
          title={item.title}
          entryId={yourEntry.id}
          initialRating={yourEntry.rating}
          initialReviewText={yourEntry.reviewText}
          onClose={() => setShowRate(false)}
        />
      )}
    </div>
  );
}
