import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileHeader from "@/components/ProfileHeader";
import ProfileTabs from "@/components/ProfileTabs";
import SavedListsSection from "@/components/SavedListsSection";
import LibraryGrid from "@/components/LibraryGrid";

export const dynamic = "force-dynamic";

export default async function ProfileShelfPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");
  const userId = session.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/signin");

  const [entries, saves] = await Promise.all([
    prisma.libraryEntry.findMany({
      where: { userId },
      include: { item: true },
      orderBy: { dateAdded: "desc" },
    }),
    prisma.listSave.findMany({
      where: { userId },
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
      <ProfileHeader user={user} isOwn readCount={readCount} libraryCount={entries.length} shelfHref="/profile/shelf" />
      <ProfileTabs basePath="/profile" />

      <SavedListsSection lists={savedLists} />

      <p className="text-xs uppercase tracking-wide text-ink/40 font-semibold mb-1">Shelf</p>
      {entries.length === 0 ? (
        <p className="text-sm text-ink/40">Nothing in your library yet.</p>
      ) : (
        <LibraryGrid entries={entries} editable storageKey={`reed-view-shelf-${userId}`} defaultView="table" />
      )}
    </div>
  );
}
