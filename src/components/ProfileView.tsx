import Link from "next/link";
import PosterCard from "./PosterCard";
import EditUsername from "./EditUsername";

type Entry = {
  id: string;
  read: boolean;
  rating: number | null;
  pinned: boolean;
  item: { id: string; title: string; url: string; source: string };
};

function initialsOf(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function ProfileView({
  user,
  entries,
  editable,
  isOwn,
}: {
  user: { id: string; name: string | null; email: string | null; username: string | null };
  entries: Entry[];
  editable: boolean;
  isOwn: boolean;
}) {
  return (
    <div>
      {!isOwn && (
        <Link href="/activity" className="text-sm text-ink/40 hover:text-ink mb-3.5 inline-block">
          ← Back
        </Link>
      )}
      <div className="flex items-center gap-4 mb-7">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white font-serif font-semibold text-xl"
          style={{ background: "#b5502f" }}
        >
          {initialsOf(user.name)}
        </div>
        <div>
          <h2 className="text-xl font-semibold m-0">
            {user.name}
            {isOwn ? " (you)" : ""}
          </h2>
          {isOwn ? (
            <EditUsername initial={user.username || ""} />
          ) : (
            <p className="text-sm text-ink/40 m-0">@{user.username}</p>
          )}
          <div className="text-sm text-ink/40 mt-1">
            {entries.filter((e) => e.read).length} read · {entries.length} in library
          </div>
        </div>
      </div>

      <p className="text-xs uppercase tracking-wide text-ink/40 font-semibold mb-3">Shelf</p>
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(126px, 1fr))" }}>
        {entries.map((e) => (
          <PosterCard
            key={e.id}
            item={e.item}
            entryId={editable ? e.id : undefined}
            read={e.read}
            rating={e.read ? e.rating : null}
            showRead={editable}
            editable={editable}
          />
        ))}
      </div>
    </div>
  );
}
