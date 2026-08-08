"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import PosterCard from "./PosterCard";
import RateModal from "./RateModal";
import { toggleRead, rateItem } from "@/app/actions";
import { posterColor } from "@/lib/posterColor";

type Entry = {
  id: string;
  read: boolean;
  rating: number | null;
  item: { id: string; title: string; url: string; source: string };
};

type View = "table" | "poster";

function GridIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

export default function LibraryGrid({
  entries,
  editable = false,
  storageKey,
  defaultView = "table",
}: {
  entries: Entry[];
  editable?: boolean;
  storageKey: string;
  defaultView?: View;
}) {
  const [view, setView] = useState<View>(defaultView);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved === "table" || saved === "poster") setView(saved);
  }, [storageKey]);

  function choose(v: View) {
    setView(v);
    localStorage.setItem(storageKey, v);
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <div className="flex gap-0.5 bg-white p-1 rounded-lg" style={{ boxShadow: "inset 0 0 0 1px var(--line)" }}>
          <button
            onClick={() => choose("table")}
            aria-label="Table view"
            className={`w-7 h-7 flex items-center justify-center rounded-md ${view === "table" ? "bg-bg text-accent" : "text-ink/40"}`}
          >
            <ListIcon />
          </button>
          <button
            onClick={() => choose("poster")}
            aria-label="Poster view"
            className={`w-7 h-7 flex items-center justify-center rounded-md ${view === "poster" ? "bg-bg text-accent" : "text-ink/40"}`}
          >
            <GridIcon />
          </button>
        </div>
      </div>

      {view === "poster" ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(126px, 1fr))" }}>
          {entries.map((e) => (
            <PosterCard
              key={e.id}
              item={e.item}
              entryId={editable ? e.id : undefined}
              read={e.read}
              rating={e.rating}
              showRead={editable}
              editable={editable}
            />
          ))}
        </div>
      ) : (
        <TableView entries={entries} editable={editable} />
      )}
    </div>
  );
}

function TableView({ entries, editable }: { entries: Entry[]; editable: boolean }) {
  const [, startTransition] = useTransition();
  const [rateFor, setRateFor] = useState<Entry | null>(null);
  const router = useRouter();

  function handleReadToggle(e: React.MouseEvent, entry: Entry) {
    e.stopPropagation();
    const willBeRead = !entry.read;
    startTransition(async () => {
      try {
        await toggleRead(entry.id);
        if (willBeRead && entry.rating == null) setRateFor(entry);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function handleStar(e: React.MouseEvent, entry: Entry, n: number) {
    e.stopPropagation();
    startTransition(async () => {
      try {
        await rateItem(entry.id, n);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="rounded-xl bg-white overflow-hidden" style={{ boxShadow: "inset 0 0 0 1px var(--line)" }}>
      {entries.map((entry, i) => (
        <div
          key={entry.id}
          onClick={() => router.push(`/book/${entry.item.id}`)}
          className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-bg ${i > 0 ? "border-t" : ""}`}
          style={{ borderColor: "var(--line)" }}
        >
          <div className="w-7 h-7 rounded shrink-0" style={{ background: posterColor(entry.item.id) }} />
          <div className="min-w-0 flex-1">
            <p className="font-serif text-sm font-semibold truncate m-0">{entry.item.title}</p>
            <p className="text-xs text-ink/40 m-0">{entry.item.source}</p>
          </div>
          {editable && (
            <div
              onClick={(e) => handleReadToggle(e, entry)}
              className="w-[22px] h-[22px] rounded-full bg-bg flex items-center justify-center text-xs cursor-pointer shrink-0"
              style={{ color: entry.read ? "#3f6b4a" : "#8c8a80", boxShadow: "inset 0 0 0 1px var(--line)" }}
              title={entry.read ? "Read" : "Mark as read"}
            >
              {entry.read ? "✓" : ""}
            </div>
          )}
          <div className="flex gap-px shrink-0" style={{ minWidth: 62 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                onClick={editable ? (e) => handleStar(e, entry, n) : undefined}
                className="text-[13px]"
                style={{ color: (entry.rating || 0) >= n ? "#c99a3c" : "var(--line)", cursor: editable ? "pointer" : "default" }}
              >
                ★
              </span>
            ))}
          </div>
          <a
            href={entry.item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[13px] text-ink/40 hover:text-accent shrink-0"
            title={`Open ${entry.item.source}`}
          >
            ↗
          </a>
        </div>
      ))}
      {rateFor && (
        <RateModal title={rateFor.item.title} entryId={rateFor.id} initialRating={null} onClose={() => setRateFor(null)} />
      )}
    </div>
  );
}
