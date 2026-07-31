import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FollowBox from "@/components/FollowBox";

export const dynamic = "force-dynamic";

function initialsOf(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default async function ActivityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");
  const userId = session.user.id;

  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    include: { following: true },
  });
  const followingIds = follows.map((f) => f.followingId);

  const events =
    followingIds.length === 0
      ? []
      : await prisma.libraryEntry.findMany({
          where: { userId: { in: followingIds }, rating: { not: null } },
          include: { item: true, user: true },
          orderBy: { dateRated: "desc" },
          take: 40,
        });

  return (
    <div>
      <FollowBox following={follows.map((f) => ({ id: f.following.id, name: f.following.name || f.following.email || "" }))} />

      {events.length === 0 ? (
        <div className="text-center py-16 text-ink/40">
          <h3 className="text-ink/60 mb-1">No activity yet</h3>
          <p>Follow someone above, and their ratings will show up here.</p>
        </div>
      ) : (
        <div>
          {events.map((e) => (
            <div key={e.id} className="flex items-center gap-3 py-3.5 border-b" style={{ borderColor: "var(--line)" }}>
              <div
                className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-white font-serif font-semibold text-xs shrink-0"
                style={{ background: "#b5502f" }}
              >
                {initialsOf(e.user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <Link href={`/u/${e.user.id}`} className="font-semibold hover:text-accent">
                    {e.user.name}
                  </Link>{" "}
                  rated <span className="font-serif font-semibold">{e.item.title}</span>
                </div>
                <div className="flex gap-px mt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className="text-[13px]" style={{ color: (e.rating || 0) >= n ? "#c99a3c" : "var(--line)" }}>
                      ★
                    </span>
                  ))}
                </div>
                <div className="text-[11.5px] text-ink/40 mt-0.5">{e.item.source}</div>
              </div>
              <a href={e.item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-ink/40 hover:text-accent">
                ↗
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
