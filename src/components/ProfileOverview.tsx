import Link from "next/link";
import PosterCard from "./PosterCard";
import FavoritesPicker from "./FavoritesPicker";
import Heatmap from "./Heatmap";
import ListCard from "./ListCard";

type Entry = {
  id: string;
  read: boolean;
  rating: number | null;
  pinned: boolean;
  dateRated: Date | null;
  item: { id: string; title: string; url: string; source: string };
};

type ListPreview = {
  id: string;
  title: string;
  description: string | null;
  itemCount: number;
};

function relTime(ts: Date | null) {
  if (!ts) return "";
  const diff = Math.max(0, Date.now() - ts.getTime());
  const day = 86400000;
  const d = Math.floor(diff / day);
  if (d < 1) return "today";
  if (d === 1) return "1 day ago";
  if (d < 14) return `${d} days ago`;
  return `${Math.floor(d / 7)} weeks ago`;
}

export default function ProfileOverview({
  entries,
  editable,
  isOwn,
  lists,
  listsCount,
  listsHref,
  username,
}: {
  entries: Entry[];
  editable: boolean;
  isOwn: boolean;
  lists: ListPreview[];
  listsCount: number;
  listsHref: string;
  username: string | null;
}) {
  const pinned = entries.filter((e) => e.pinned);
  const reviews = entries.filter((e) => e.rating != null).sort((a, b) => (b.dateRated?.getTime() || 0) - (a.dateRated?.getTime() || 0));

  const counts: Record<string, number> = {};
  for (const e of reviews) {
    if (!e.dateRated) continue;
    const key = e.dateRated.toISOString().slice(0, 10);
    counts[key] = (counts[key] || 0) + 1;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wide text-ink/40 font-semibold m-0">Favorites</p>
        {isOwn && <FavoritesPicker entries={entries.filter((e) => e.read).map((e) => ({ id: e.id, pinned: e.pinned, item: { title: e.item.title } }))} />}
      </div>
      <div className="grid grid-cols-4 gap-4 mb-8 max-w-lg">
        {[0, 1, 2, 3].map((i) => {
          const e = pinned[i];
          if (!e)
            return (
              <div
                key={i}
                className="rounded-md bg-white"
                style={{ aspectRatio: "5/7", boxShadow: "inset 0 0 0 1px var(--line)" }}
              />
            );
          return <PosterCard key={e.id} item={e.item} entryId={e.id} read={e.read} rating={e.rating} showRead editable={editable} />;
        })}
      </div>

      {(lists.length > 0 || isOwn) && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-wide text-ink/40 font-semibold m-0">My Lists</p>
            {listsCount > 0 && (
              <Link href={listsHref} className="text-xs text-accent underline">
                See all ({listsCount}) →
              </Link>
            )}
          </div>
          <div className="mb-8">
            {lists.length === 0 ? (
              <p className="text-sm text-ink/40">
                {isOwn ? "You haven't made any lists yet." : "No lists yet."}
              </p>
            ) : (
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
                {lists.map((l) => (
                  <ListCard key={l.id} list={l} href={`/u/${username}/lists/${l.id}`} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <p className="text-xs uppercase tracking-wide text-ink/40 font-semibold mb-3">Reading activity</p>
      <div className="mb-8">
        <Heatmap counts={counts} />
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wide text-ink/40 font-semibold m-0">Recent activity</p>
        {isOwn && (
          <Link href="/activity" className="text-xs text-accent underline">
            See all activity →
          </Link>
        )}
      </div>
      <div>
        {reviews.length === 0 ? (
          <p className="text-sm text-ink/40">Nothing rated yet.</p>
        ) : (
          reviews.slice(0, 8).map((e) => (
            <Link
              key={e.id}
              href={`/review/${e.id}`}
              className="flex items-center justify-between gap-3 py-2.5 border-b hover:bg-white/60 -mx-2 px-2 rounded-lg"
              style={{ borderColor: "var(--line)" }}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{e.item.title}</p>
                <div className="flex gap-px mt-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className="text-xs" style={{ color: (e.rating || 0) >= n ? "#c99a3c" : "var(--line)" }}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-xs text-ink/40 shrink-0">{relTime(e.dateRated)}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
