import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileHeader from "@/components/ProfileHeader";
import ProfileTabs from "@/components/ProfileTabs";
import ProfileOverview from "@/components/ProfileOverview";

export const dynamic = "force-dynamic";

export default async function FriendProfilePage({ params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");

  const user = await prisma.user.findUnique({ where: { username: params.username } });
  if (!user) notFound();

  if (user.id === session.user.id) redirect("/profile");

  const [entries, follow, lists, listsCount] = await Promise.all([
    prisma.libraryEntry.findMany({
      where: { userId: user.id },
      include: { item: true },
      orderBy: { dateAdded: "desc" },
    }),
    prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: session.user.id, followingId: user.id } },
    }),
    prisma.list.findMany({
      where: { ownerId: user.id, public: true },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { _count: { select: { items: true } } },
    }),
    prisma.list.count({ where: { ownerId: user.id, public: true } }),
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
      <ProfileOverview
        entries={entries}
        editable={false}
        isOwn={false}
        lists={lists.map((l) => ({ id: l.id, title: l.title, description: l.description, itemCount: l._count.items }))}
        listsCount={listsCount}
        listsHref={`/u/${user.username}/lists`}
        username={user.username}
      />
    </div>
  );
}
