import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileHeader from "@/components/ProfileHeader";
import ProfileTabs from "@/components/ProfileTabs";
import ListCard from "@/components/ListCard";

export const dynamic = "force-dynamic";

export default async function FriendListsPage({ params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");

  const user = await prisma.user.findUnique({ where: { username: params.username } });
  if (!user) notFound();
  if (user.id === session.user.id) redirect("/profile/lists");

  const [entries, follow, lists] = await Promise.all([
    prisma.libraryEntry.findMany({ where: { userId: user.id }, select: { read: true } }),
    prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: session.user.id, followingId: user.id } },
    }),
    prisma.list.findMany({
      where: { ownerId: user.id, public: true },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } },
    }),
  ]);

  const readCount = entries.filter((e) => e.read).length;

  return (
    <div>
      <ProfileHeader
        user={user}
        isOwn={false}
        isFollowing={!!follow}
        readCount={readCount}
        libraryCount={entries.length}
        savedHref={`/u/${user.username}/saved`}
      />
      <ProfileTabs basePath={`/u/${user.username}`} />

      <p className="text-xs uppercase tracking-wide text-ink/40 font-semibold mb-4">My Lists</p>

      {lists.length === 0 ? (
        <p className="text-sm text-ink/40">No lists yet.</p>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          {lists.map((l) => (
            <ListCard
              key={l.id}
              list={{ id: l.id, title: l.title, description: l.description, itemCount: l._count.items }}
              href={`/u/${user.username}/lists/${l.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
