import Link from "next/link";

type ListPreview = {
  id: string;
  title: string;
  description: string | null;
  itemCount: number;
};

export default function ListCard({
  list,
  href,
  ownerUsername,
  progress,
}: {
  list: ListPreview;
  href: string;
  ownerUsername?: string | null;
  progress?: { read: number; total: number } | null;
}) {
  return (
    <Link
      href={href}
      className="block p-4 rounded-xl bg-white hover:bg-bg"
      style={{ boxShadow: "inset 0 0 0 1px var(--line)" }}
    >
      <p className="font-serif text-[15px] font-semibold mb-1 line-clamp-1">{list.title}</p>
      {list.description ? (
        <p className="text-xs text-ink/50 line-clamp-2 mb-2">{list.description}</p>
      ) : (
        <p className="text-xs text-ink/30 mb-2">No description</p>
      )}
      <div className="flex items-center justify-between text-xs text-ink/40">
        <span>
          {list.itemCount} item{list.itemCount === 1 ? "" : "s"}
          {ownerUsername ? ` · ${ownerUsername}` : ""}
        </span>
        {progress && progress.total > 0 && (
          <span className="text-ink/50 font-medium">
            {progress.read}/{progress.total}
          </span>
        )}
      </div>
    </Link>
  );
}
