import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PosterCard from "@/components/PosterCard";

export const dynamic = "force-dynamic";

export default async function PopularPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");
  const userId = session.user.id;

  const follows = await prisma.follow.findMany({ where: { followerId: userId } });
  const scopeIds = [userId, ...follows.map((f) => f.followingId)];

  const rated = await prisma.libraryEntry.findMany({
    where: { userId: { in: scopeIds }, rating: { not: null } },
    include: { item: true },
  });

  const yourLib = await prisma.libraryEntry.findMany({ where: { userId } });
  const yourItemIds = new Set(yourLib.map((e) => e.itemId));

  type Agg = { item: (typeof rated)[number]["item"]; sum: number; count: number };
  const agg = new Map<string, Agg>();
  for (const e of rated) {
    const cur = agg.get(e.itemId) || { item: e.item, sum: 0, count: 0 };
    cur.sum += e.rating || 0;
    cur.count += 1;
    agg.set(e.itemId, cur);
  }
  const ranked = Array.from(agg.values()).sort((a, b) => b.sum / b.count - a.sum / a.count || b.count - a.count);

  return (
    <div>
      {ranked.length === 0 ? (
        <div className="text-center py-16 text-ink/40">
          <h3 className="text-ink/60 mb-1">Nothing rated yet</h3>
          <p>Once you or people you follow rate something, it&apos;ll rank here.</p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(126px, 1fr))" }}>
          {ranked.map((r) => {
            const avg = Math.round((r.sum / r.count) * 10) / 10;
            return (
              <PosterCard
                key={r.item.id}
                item={{ id: r.item.id, title: r.item.title, url: r.item.url, source: r.item.source }}
                rating={Math.round(avg)}
                avgLabel={`${avg.toFixed(1)} · ${r.count}`}
                showAdd
                inLibrary={yourItemIds.has(r.item.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
