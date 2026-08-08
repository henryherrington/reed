"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { rateItem } from "@/app/actions";
import { posterColor } from "@/lib/posterColor";

type Props = {
  entryId: string;
  rating: number | null;
  reviewText: string | null;
  dateRated: string | null;
  reviewerName: string | null;
  item: { id: string; title: string; url: string; source: string };
  isOwn: boolean;
  startInEditing?: boolean;
};

function initialsOf(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function ReviewView({ entryId, rating, reviewText, dateRated, reviewerName, item, isOwn, startInEditing }: Props) {
  const [editing, setEditing] = useState((!!startInEditing || rating == null) && isOwn);
  const [selected, setSelected] = useState(rating || 0);
  const [text, setText] = useState(reviewText || "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const color = posterColor(item.id);

  async function save() {
    if (!selected) return;
    setSaving(true);
    try {
      await rateItem(entryId, selected, text.trim());
      setEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
    setSaving(false);
  }

  function cancel() {
    if (rating == null) {
      router.push(`/book/${item.id}`);
      return;
    }
    setSelected(rating);
    setText(reviewText || "");
    setEditing(false);
  }

  return (
    <div>
      <div className="flex gap-6 mb-8">
        <div className="rounded-md shrink-0" style={{ background: color, width: 90, aspectRatio: "5/7" }} />
        <div className="min-w-0">
          <Link href={`/book/${item.id}`} className="font-serif text-xl font-semibold mb-1 hover:text-accent block">
            {item.title}
          </Link>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-ink/50 hover:text-accent inline-flex items-center gap-1">
            {item.source} <span>↗</span>
          </a>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-serif font-semibold text-xs shrink-0"
          style={{ background: "#b5502f" }}
        >
          {initialsOf(reviewerName)}
        </div>
        <div>
          <p className="text-sm font-medium">
            {reviewerName}
            {isOwn ? " (you)" : ""}
          </p>
          {dateRated && <p className="text-xs text-ink/40">{new Date(dateRated).toLocaleDateString()}</p>}
        </div>
      </div>

      {editing ? (
        <div>
          <div className="flex gap-1.5 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                onClick={() => setSelected(n)}
                className="text-2xl cursor-pointer"
                style={{ color: selected >= n ? "#c99a3c" : "var(--line)" }}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a review (optional)"
            rows={5}
            className="w-full px-3 py-2 rounded-lg border text-sm resize-none mb-3"
            style={{ borderColor: "var(--line)" }}
          />
          <div className="flex gap-2.5">
            <button onClick={cancel} className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--line)" }}>
              Cancel
            </button>
            <button onClick={save} disabled={saving || !selected} className="px-4 py-2 rounded-lg text-sm bg-ink text-white">
              Save
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className="text-xl" style={{ color: (rating ?? 0) >= n ? "#c99a3c" : "var(--line)" }}>
                ★
              </span>
            ))}
          </div>
          {reviewText ? (
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{reviewText}</p>
          ) : (
            <p className="text-sm text-ink/40">No written review, just a rating.</p>
          )}
          {isOwn && (
            <button onClick={() => setEditing(true)} className="text-sm text-accent underline mt-4">
              Edit your review
            </button>
          )}
        </div>
      )}
    </div>
  );
}
