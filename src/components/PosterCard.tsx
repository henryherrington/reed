"use client";

import { useState, useTransition } from "react";
import { toggleRead, togglePin, rateItem, addFromPopular } from "@/app/actions";
import RateModal from "./RateModal";

type Item = { id: string; title: string; url: string; source: string };

const POSTER_COLORS = ["#e7d9c4", "#cddccb", "#e6cdbf", "#c6d3e2", "#ddc9d5", "#d3ddc4", "#e3d7bd", "#c3d6d4"];

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function posterColor(id: string) {
  return POSTER_COLORS[hashStr(id) % POSTER_COLORS.length];
}

export default function PosterCard({
  item,
  entryId,
  read = false,
  rating = null,
  pinned = false,
  showRead = false,
  showPin = false,
  showAdd = false,
  inLibrary = false,
  editable = false,
  avgLabel,
}: {
  item: Item;
  entryId?: string;
  read?: boolean;
  rating?: number | null;
  pinned?: boolean;
  showRead?: boolean;
  showPin?: boolean;
  showAdd?: boolean;
  inLibrary?: boolean;
  editable?: boolean;
  avgLabel?: string;
}) {
  const [, startTransition] = useTransition();
  const [showRate, setShowRate] = useState(false);
  const color = posterColor(item.id);

  function handleReadToggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (!entryId) return;
    const willBeRead = !read;
    startTransition(async () => {
      try {
        await toggleRead(entryId);
        if (willBeRead && rating == null) setShowRate(true);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function handlePin(e: React.MouseEvent) {
    e.stopPropagation();
    if (!entryId) return;
    startTransition(async () => {
      try {
        await togglePin(entryId);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    startTransition(async () => {
      try {
        await addFromPopular(item.id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function handleStar(n: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (!entryId) return;
    startTransition(async () => {
      try {
        await rateItem(entryId, n);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="relative w-full rounded-md overflow-hidden cursor-pointer flex items-end p-2.5"
        style={{ background: color, aspectRatio: "5/7" }}
        onClick={() => window.open(item.url, "_blank")}
      >
        {showPin && (
          <div
            onClick={handlePin}
            className="absolute top-1.5 right-1.5 w-[22px] h-[22px] rounded-full bg-white/90 flex items-center justify-center text-xs cursor-pointer"
            style={{ color: pinned ? "#c99a3c" : "#8c8a80" }}
          >
            {pinned ? "★" : "☆"}
          </div>
        )}
        {showRead && (
          <div
            onClick={handleReadToggle}
            className="absolute bottom-1.5 left-1.5 w-[22px] h-[22px] rounded-full bg-white/90 flex items-center justify-center text-xs cursor-pointer"
            style={{ color: read ? "#3f6b4a" : "#8c8a80" }}
          >
            {read ? "✓" : ""}
          </div>
        )}
        {showAdd && (
          <div
            onClick={inLibrary ? undefined : handleAdd}
            className="absolute top-1.5 left-1.5 w-[22px] h-[22px] rounded-full bg-white/90 flex items-center justify-center text-sm cursor-pointer"
            style={{ color: inLibrary ? "#3f6b4a" : "#5a5850" }}
          >
            {inLibrary ? "✓" : "+"}
          </div>
        )}
        <div className="font-serif text-[13px] font-semibold leading-tight line-clamp-5">{item.title}</div>
      </div>
      <div className="flex items-center justify-between px-px">
        {rating != null ? (
          <div className="flex gap-px items-center">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                onClick={editable ? (e) => handleStar(n, e) : undefined}
                className="text-[13px]"
                style={{ color: rating >= n ? "#c99a3c" : "var(--line)", cursor: editable ? "pointer" : "default" }}
              >
                ★
              </span>
            ))}
            {avgLabel && <span className="text-[11px] text-ink/40 ml-1">{avgLabel}</span>}
          </div>
        ) : (
          <span />
        )}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[13px] text-ink/40 hover:text-accent px-0.5"
          title={`Open ${item.source}`}
        >
          ↗
        </a>
      </div>
      {showRate && entryId && (
        <RateModal title={item.title} entryId={entryId} initialRating={rating ?? null} onClose={() => setShowRate(false)} />
      )}
    </div>
  );
}
