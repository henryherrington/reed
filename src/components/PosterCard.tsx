"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { rateItem, addToLibrary } from "@/app/actions";
import { posterColor } from "@/lib/posterColor";
import EyeIcon from "./EyeIcon";

type Item = { id: string; title: string; url: string; source: string };

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
    </svg>
  );
}

export default function PosterCard({
  item,
  entryId,
  read = false,
  rating = null,
  showRead = false,
  showAdd = false,
  inLibrary = false,
  editable = false,
  avgLabel,
}: {
  item: Item;
  entryId?: string;
  read?: boolean;
  rating?: number | null;
  showRead?: boolean;
  showAdd?: boolean;
  inLibrary?: boolean;
  editable?: boolean;
  avgLabel?: string;
}) {
  const [, startTransition] = useTransition();
  const color = posterColor(item.id);
  const router = useRouter();

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    startTransition(async () => {
      try {
        await addToLibrary(item.id);
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
        onClick={() => router.push(`/book/${item.id}`)}
      >
        {(showRead || showAdd) && (
          <div className="absolute top-1.5 right-1.5 flex gap-1">
            {showRead && (
              <div
                className="w-6 h-6 rounded-full bg-white/85 flex items-center justify-center"
                style={{ color: read ? "#20201d" : "#6b6960" }}
              >
                <EyeIcon open={read} width={13} height={13} />
              </div>
            )}
            {showAdd && (
              <div
                onClick={inLibrary ? undefined : handleAdd}
                className="w-6 h-6 rounded-full bg-white/85 flex items-center justify-center"
                style={{ color: inLibrary ? "#20201d" : "#6b6960", cursor: inLibrary ? "default" : "pointer" }}
              >
                {inLibrary ? <BookmarkIcon /> : <PlusIcon />}
              </div>
            )}
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
    </div>
  );
}
