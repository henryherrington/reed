import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileHeader from "@/components/ProfileHeader";
import ProfileTabs from "@/components/ProfileTabs";
import SavedListsSection from "@/components/SavedListsSection";
import LibraryGrid from "@/components/LibraryGrid";

export const dynamic = "force-dynamic";

export default async function FriendShelfPage({ params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");

  const user = await prisma.user.findUnique({ where: { username: params.username } });
  if (!user) notFound();
  if (user.id === session.user.id) redirect("/profile/shelf");

  const [entries, follow, saves] = await Promise.all([
    prisma.libraryEntry.findMany({
      where: { userId: user.id },
      include: { item: true },
      orderBy: { dateAdded: "desc" },
    }),
    prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: session.user.id, followingId: user.id } },
    }),
    prisma.listSave.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        list: {
          include: { owner: { select: { username: true } }, items: { select: { itemId: true } } },
        },
      },
    }),
  ]);

  const readCount = entries.filter((e) => e.read).length;
  const readItemIds = new Set(entries.filter((e) => e.read).map((e) => e.itemId));

  const savedLists = saves.map((s) => ({
    id: s.list.id,
    title: s.list.title,
    description: s.list.description,
    itemCount: s.list.items.length,
    ownerUsername: s.list.owner.username,
    total: s.list.items.length,
    read: s.list.items.filter((li) => readItemIds.has(li.itemId)).length,
  }));

  return (
    <div>
      <ProfileHeader
        user={user}
        isOwn={false}
        isFollowing={!!follow}
        readCount={readCount}
        libraryCount={entries.length}
        shelfHref={`/u/${user.username}/shelf`}
      />
      <ProfileTabs basePath={`/u/${user.username}`} />

      <SavedListsSection lists={savedLists} />

      <p className="text-xs uppercase tracking-wide text-ink/40 font-semibold mb-1">Shelf</p>
      {entries.length === 0 ? (
        <p className="text-sm text-ink/40">Nothing in their library yet.</p>
      ) : (
        <LibraryGrid entries={entries} editable={false} storageKey={`reed-view-shelf-${user.id}`} defaultView="table" />
      )}
    </div>
  );
}
