import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PosterCard from "@/components/PosterCard";
import AddItemButton from "@/components/AddItemButton";
import SortSelect from "@/components/SortSelect";

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

  const readFilter = searchParams.read === "read" || searchParams.read === "unread" ? searchParams.read : "all";
  const sort = searchParams.sort === "rating" ? "rating" : "recent";

  const entries = await prisma.libraryEntry.findMany({
    where: {
      userId: session.user.id,
      ...(readFilter === "read" ? { read: true } : {}),
      ...(readFilter === "unread" ? { read: false } : {}),
    },
    include: { item: true },
    orderBy: sort === "rating" ? { rating: "desc" } : { dateAdded: "desc" },
  });

  return (
    <div>
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
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(126px, 1fr))" }}>
          {entries.map((e) => (
            <PosterCard
              key={e.id}
              item={{ id: e.item.id, title: e.item.title, url: e.item.url, source: e.item.source }}
              entryId={e.id}
              read={e.read}
              rating={e.read ? e.rating : null}
              pinned={e.pinned}
              showRead
              showPin={e.read}
              editable
            />
          ))}
        </div>
      )}
    </div>
  );
}
