import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PosterCard from "@/components/PosterCard";
import AddItemButton from "@/components/AddItemButton";
import SortSelect from "@/components/SortSelect";
import Rail from "@/components/Rail";
import LibraryGrid from "@/components/LibraryGrid";

export const dynamic = "force-dynamic";

function filterHref(read: string, sort: string) {
  const params = new URLSearchParams();
  if (read !== "all") params.set("read", read);
  if (sort !== "recent") params.set("sort", sort);
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { read?: string; sort?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");
  const userId = session.user.id;

  const readFilter = searchParams.read === "read" || searchParams.read === "unread" ? searchParams.read : "all";
  const sort = searchParams.sort === "rating" ? "rating" : "recent";

  const [entries, upNext, myLib, follows] = await Promise.all([
    prisma.libraryEntry.findMany({
      where: {
        userId,
        ...(readFilter === "read" ? { read: true } : {}),
        ...(readFilter === "unread" ? { read: false } : {}),
      },
      include: { item: true },
      orderBy: sort === "rating" ? { rating: "desc" } : { dateAdded: "desc" },
    }),
    prisma.libraryEntry.findMany({
      where: { userId, read: false },
      include: { item: true },
      orderBy: { dateAdded: "desc" },
      take: 10,
    }),
    prisma.libraryEntry.findMany({ where: { userId }, select: { itemId: true } }),
    prisma.follow.findMany({ where: { followerId: userId }, select: { followingId: true } }),
  ]);

  const scopeIds = [userId, ...follows.map((f) => f.followingId)];
  const myItemIds = new Set(myLib.map((e) => e.itemId));

  const rated = await prisma.libraryEntry.findMany({
    where: { userId: { in: scopeIds }, rating: { not: null } },
    include: { item: true },
  });

  const agg: Record<string, { item: (typeof rated)[number]["item"]; sum: number; count: number }> = {};
  for (const e of rated) {
    if (!e.item) continue;
    if (!agg[e.item.id]) agg[e.item.id] = { item: e.item, sum: 0, count: 0 };
    agg[e.item.id].sum += e.rating!;
    agg[e.item.id].count += 1;
  }
  const trending = Object.values(agg)
    .map((a) => ({ ...a, avg: a.sum / a.count }))
    .sort((a, b) => b.avg - a.avg || b.count - a.count)
    .slice(0, 10);

  return (
    <div>
      {upNext.length > 0 && (
        <Rail title="Up next">
          {upNext.map((e) => (
            <div key={e.id} style={{ width: 126 }} className="shrink-0">
              <PosterCard
                item={{ id: e.item.id, title: e.item.title, url: e.item.url, source: e.item.source }}
                entryId={e.id}
                read={e.read}
                rating={e.rating}
                showRead
                editable
              />
            </div>
          ))}
        </Rail>
      )}

      {trending.length > 0 && (
        <Rail title="Trending">
          {trending.map((t) => (
            <div key={t.item.id} style={{ width: 126 }} className="shrink-0">
              <PosterCard
                item={t.item}
                showAdd
                inLibrary={myItemIds.has(t.item.id)}
                avgLabel={t.avg.toFixed(1)}
                rating={Math.round(t.avg)}
              />
            </div>
          ))}
        </Rail>
      )}

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wide text-ink/40 font-semibold m-0">Your library</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex gap-0.5 bg-white p-1 rounded-lg" style={{ boxShadow: "inset 0 0 0 1px var(--line)" }}>
          {["all", "unread", "read"].map((v) => (
            <Link
              key={v}
              href={filterHref(v, sort)}
              className={`px-3 py-1.5 rounded-md text-xs ${readFilter === v ? "bg-bg text-accent font-semibold" : "text-ink/60"}`}
            >
              {v[0].toUpperCase() + v.slice(1)}
            </Link>
          ))}
        </div>
        <SortSelect current={sort} />
        <span className="ml-auto text-xs text-ink/40">
          {entries.length} item{entries.length === 1 ? "" : "s"}
        </span>
        <AddItemButton />
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 text-ink/40">
          <h3 className="text-ink/60 mb-1">Nothing here</h3>
          <p>Add something you&apos;ve been meaning to read.</p>
        </div>
      ) : (
        <LibraryGrid entries={entries} editable storageKey="reed-view-home" defaultView="table" />
      )}
    </div>
  );
}
