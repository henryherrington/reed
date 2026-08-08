import ListCard from "./ListCard";

type SavedList = {
  id: string;
  title: string;
  description: string | null;
  itemCount: number;
  ownerUsername: string | null;
  read: number;
  total: number;
};

export default function SavedListsSection({ lists }: { lists: SavedList[] }) {
  if (lists.length === 0) return null;

  return (
    <div className="mb-8">
      <p className="text-xs uppercase tracking-wide text-ink/40 font-semibold mb-3">Saved lists</p>
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
        {lists.map((l) => (
          <ListCard
            key={l.id}
            list={l}
            href={`/u/${l.ownerUsername}/lists/${l.id}`}
            ownerUsername={l.ownerUsername}
            progress={{ read: l.read, total: l.total }}
          />
        ))}
      </div>
    </div>
  );
}
