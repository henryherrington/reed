"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { rateItem, addToLibrary } from "@/app/actions";
import { posterColor } from "@/lib/posterColor";
import EyeIcon from "./EyeIcon";

type Item = { id: string; title: string; url: string; source: string };

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
        {showRead && (
          <div
            className="absolute top-1.5 right-1.5 w-[22px] h-[22px] rounded-full bg-white/70 flex items-center justify-center"
            style={{ color: read ? "#3f6b4a" : "#8c8a80" }}
          >
            <EyeIcon open={read} width={11} height={11} />
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
    </div>
  );
}
