import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileHeader from "@/components/ProfileHeader";
import ProfileTabs from "@/components/ProfileTabs";
import ProfileOverview from "@/components/ProfileOverview";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/signin");

  const [entries, lists, listsCount] = await Promise.all([
    prisma.libraryEntry.findMany({
      where: { userId: session.user.id },
      include: { item: true },
      orderBy: { dateAdded: "desc" },
    }),
    prisma.list.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { _count: { select: { items: true } } },
    }),
    prisma.list.count({ where: { ownerId: session.user.id } }),
  ]);

  const readCount = entries.filter((e) => e.read).length;

  return (
    <div>
      <ProfileHeader user={user} isOwn readCount={readCount} libraryCount={entries.length} shelfHref="/profile/shelf" />
      <ProfileTabs basePath="/profile" />
      <ProfileOverview
        entries={entries}
        editable
        isOwn
        lists={lists.map((l) => ({ id: l.id, title: l.title, description: l.description, itemCount: l._count.items }))}
        listsCount={listsCount}
        listsHref="/profile/lists"
        username={user.username}
      />
    </div>
  );
}
