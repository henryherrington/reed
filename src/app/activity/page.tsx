import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FollowSearch from "@/components/FollowSearch";

export const dynamic = "force-dynamic";

function initialsOf(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

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

export default async function ActivityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");
  const userId = session.user.id;

  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    include: { following: { select: { id: true, name: true, username: true } } },
  });
  const scopeIds = [userId, ...follows.map((f) => f.followingId)];

  const events = await prisma.libraryEntry.findMany({
    where: { userId: { in: scopeIds }, rating: { not: null } },
    include: { item: true, user: true },
    orderBy: { dateRated: "desc" },
    take: 50,
  });

  return (
    <div>
      <FollowSearch following={follows.map((f) => f.following)} />

      {events.length === 0 ? (
        <div className="text-center py-16 text-ink/40">
          <h3 className="text-ink/60 mb-1">No activity yet</h3>
          <p>Rate something, or find people to follow above.</p>
        </div>
      ) : (
        <div>
          {events.map((e) => (
            <div key={e.id} className="flex items-center gap-3 py-3.5 border-b" style={{ borderColor: "var(--line)" }}>
              <Link
                href={`/u/${e.user.username}`}
                className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-white font-serif font-semibold text-xs shrink-0"
                style={{ background: "#b5502f" }}
              >
                {initialsOf(e.user.name)}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <Link href={`/u/${e.user.username}`} className="font-semibold hover:text-accent">
                    {e.userId === userId ? "You" : e.user.name}
                  </Link>{" "}
                  rated{" "}
                  <Link href={`/review/${e.id}`} className="font-serif font-semibold hover:text-accent">
                    {e.item.title}
                  </Link>
                </div>
                <div className="flex gap-px mt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className="text-[13px]" style={{ color: (e.rating || 0) >= n ? "#c99a3c" : "var(--line)" }}>
                      ★
                    </span>
                  ))}
                </div>
                <div className="text-[11.5px] text-ink/40 mt-0.5">
                  {relTime(e.dateRated)} · {e.item.source}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
