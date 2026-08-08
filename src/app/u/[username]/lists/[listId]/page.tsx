import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ListDetailBody from "@/components/ListDetailBody";

export const dynamic = "force-dynamic";

export default async function ListDetailPage({
  params,
  searchParams,
}: {
  params: { username: string; listId: string };
  searchParams: { edit?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");
  const userId = session.user.id;

  const owner = await prisma.user.findUnique({ where: { username: params.username } });
  if (!owner) notFound();

  const list = await prisma.list.findUnique({
    where: { id: params.listId },
    include: {
      items: { orderBy: { position: "asc" }, include: { item: true } },
      _count: { select: { saves: true } },
    },
  });

  if (!list || list.ownerId !== owner.id) notFound();

  const isOwn = list.ownerId === userId;
  if (!list.public && !isOwn) notFound();

  const [myEntries, mySave] = await Promise.all([
    prisma.libraryEntry.findMany({ where: { userId, read: true }, select: { itemId: true } }),
    isOwn ? null : prisma.listSave.findUnique({ where: { userId_listId: { userId, listId: list.id } } }),
  ]);
  const readItemIds = new Set(myEntries.map((e) => e.itemId));

  const items = list.items.map((li) => ({
    id: li.id,
    note: li.note,
    read: readItemIds.has(li.itemId),
    item: { id: li.item.id, title: li.item.title, url: li.item.url, source: li.item.source },
  }));

  const listsHref = isOwn ? "/profile/lists" : `/u/${owner.username}/lists`;

  return (
    <ListDetailBody
      list={{ id: list.id, title: list.title, description: list.description, public: list.public }}
      items={items}
      isOwn={isOwn}
      isSaved={!!mySave}
      ownerUsername={owner.username}
      savesCount={list._count.saves}
      listsHref={listsHref}
      startInEditing={searchParams.edit === "1"}
    />
  );
}
