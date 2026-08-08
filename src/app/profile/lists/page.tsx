import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileHeader from "@/components/ProfileHeader";
import ProfileTabs from "@/components/ProfileTabs";
import ListCard from "@/components/ListCard";
import NewListButton from "@/components/NewListButton";

export const dynamic = "force-dynamic";

export default async function MyListsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");
  const userId = session.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/signin");

  const [entries, lists] = await Promise.all([
    prisma.libraryEntry.findMany({ where: { userId }, select: { read: true } }),
    prisma.list.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } },
    }),
  ]);

  const readCount = entries.filter((e) => e.read).length;

  return (
    <div>
      <ProfileHeader user={user} isOwn readCount={readCount} libraryCount={entries.length} savedHref="/profile/saved" />
      <ProfileTabs basePath="/profile" />

      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-wide text-ink/40 font-semibold m-0">My Lists</p>
        <NewListButton username={user.username || ""} />
      </div>

      {lists.length === 0 ? (
        <div className="text-center py-16 text-ink/40">
          <h3 className="text-ink/60 mb-1">No lists yet</h3>
          <p>Curate a collection of what you&apos;ve read around a theme, and share it.</p>
        </div>
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
