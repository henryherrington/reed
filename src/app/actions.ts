"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not signed in");
  return session.user.id;
}

function revalidateAll(itemId?: string, entryId?: string) {
  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/activity");
  if (itemId) revalidatePath(`/book/${itemId}`);
  if (entryId) revalidatePath(`/review/${entryId}`);
}

export async function updateUsername(raw: string) {
  const userId = await requireUserId();
  const username = raw.trim().toLowerCase();

  if (!/^[a-z0-9_-]{3,24}$/.test(username)) {
    throw new Error("Usernames are 3-24 characters: lowercase letters, numbers, - or _ only.");
  }

  try {
    await prisma.user.update({ where: { id: userId }, data: { username } });
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code === "P2002") throw new Error("That username is taken.");
    throw err;
  }

  revalidatePath("/", "layout");
  revalidatePath("/profile");
}

export async function searchItems(query: string) {
  await requireUserId();
  const q = query.trim();
  if (!q) return [];

  return prisma.item.findMany({
    where: { title: { contains: q, mode: "insensitive" } },
    orderBy: { title: "asc" },
    take: 8,
  });
}

export async function addItem(title: string, url: string) {
  const userId = await requireUserId();
  let source = url;
  try {
    source = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    // leave source as the raw url if it doesn't parse
  }

  const item = await prisma.item.upsert({
    where: { url },
    update: {},
    create: { title, url, source },
  });

  await prisma.libraryEntry.upsert({
    where: { userId_itemId: { userId, itemId: item.id } },
    update: {},
    create: { userId, itemId: item.id },
  });

  revalidateAll(item.id);
  return item;
}

export async function addToLibrary(itemId: string) {
  const userId = await requireUserId();
  await prisma.libraryEntry.upsert({
    where: { userId_itemId: { userId, itemId } },
    update: {},
    create: { userId, itemId },
  });

  revalidateAll(itemId);
}

export async function toggleRead(entryId: string) {
  const userId = await requireUserId();
  const entry = await prisma.libraryEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.userId !== userId) throw new Error("Not found");

  const read = !entry.read;
  await prisma.libraryEntry.update({
    where: { id: entryId },
    data: read
      ? { read: true }
      : { read: false, rating: null, reviewText: null, pinned: false, dateRated: null },
  });

  revalidateAll(entry.itemId, entryId);
}

export async function rateItem(entryId: string, rating: number, reviewText?: string) {
  const userId = await requireUserId();
  const entry = await prisma.libraryEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.userId !== userId) throw new Error("Not found");

  await prisma.libraryEntry.update({
    where: { id: entryId },
    data: {
      rating,
      dateRated: new Date(),
      read: true,
      ...(reviewText !== undefined ? { reviewText: reviewText || null } : {}),
    },
  });

  revalidateAll(entry.itemId, entryId);
}

export async function togglePin(entryId: string) {
  const userId = await requireUserId();
  const entry = await prisma.libraryEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.userId !== userId) throw new Error("Not found");

  if (!entry.pinned) {
    const pinnedCount = await prisma.libraryEntry.count({ where: { userId, pinned: true } });
    if (pinnedCount >= 4) throw new Error("You can only pin 4 favorites. Unpin one first.");
  }

  await prisma.libraryEntry.update({ where: { id: entryId }, data: { pinned: !entry.pinned } });

  revalidateAll(entry.itemId, entryId);
}

export async function searchUsers(query: string) {
  const userId = await requireUserId();
  const q = query.trim();
  if (!q) return [];

  return prisma.user.findMany({
    where: {
      id: { not: userId },
      username: { contains: q, mode: "insensitive" },
    },
    select: { id: true, name: true, username: true },
    orderBy: { username: "asc" },
    take: 8,
  });
}

export async function globalSearch(query: string) {
  const userId = await requireUserId();
  const q = query.trim();
  if (!q) return { users: [], items: [] };

  const [users, items] = await Promise.all([
    prisma.user.findMany({
      where: {
        id: { not: userId },
        OR: [{ username: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }],
      },
      select: { id: true, name: true, username: true },
      orderBy: { username: "asc" },
      take: 5,
    }),
    prisma.item.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      orderBy: { title: "asc" },
      take: 5,
    }),
  ]);

  return { users, items };
}

export async function followUser(targetUserId: string) {
  const userId = await requireUserId();
  if (targetUserId === userId) throw new Error("That's you.");

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: userId, followingId: targetUserId } },
    update: {},
    create: { followerId: userId, followingId: targetUserId },
  });

  revalidatePath("/activity");
  revalidatePath("/");
}

export async function followByEmail(email: string) {
  const userId = await requireUserId();
  const target = await prisma.user.findUnique({ where: { email } });
  if (!target) throw new Error("No one has signed in to Reed with that email yet.");
  if (target.id === userId) throw new Error("That's you.");

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: userId, followingId: target.id } },
    update: {},
    create: { followerId: userId, followingId: target.id },
  });

  revalidatePath("/activity");
}

export async function unfollow(followingId: string) {
  const userId = await requireUserId();
  await prisma.follow.deleteMany({ where: { followerId: userId, followingId } });

  revalidatePath("/activity");
  revalidatePath("/");
}

function revalidateLists(username?: string | null, listId?: string) {
  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/profile/shelf");
  revalidatePath("/profile/lists");
  if (username) {
    revalidatePath(`/u/${username}`);
    revalidatePath(`/u/${username}/shelf`);
    revalidatePath(`/u/${username}/lists`);
    if (listId) revalidatePath(`/u/${username}/lists/${listId}`);
  }
}

export async function searchMyLibraryItems(query: string) {
  const userId = await requireUserId();
  const q = query.trim();
  if (!q) return [];

  const entries = await prisma.libraryEntry.findMany({
    where: { userId, item: { title: { contains: q, mode: "insensitive" } } },
    include: { item: true },
    orderBy: { item: { title: "asc" } },
    take: 8,
  });

  return entries.map((e) => e.item);
}

export async function createList(title: string, description: string, isPublic: boolean) {
  const userId = await requireUserId();
  const t = title.trim();
  if (!t) throw new Error("Give your list a title.");

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });

  const list = await prisma.list.create({
    data: { ownerId: userId, title: t, description: description.trim() || null, public: isPublic },
  });

  revalidateLists(user?.username);
  return list;
}

export async function updateList(listId: string, data: { title?: string; description?: string; public?: boolean }) {
  const userId = await requireUserId();
  const list = await prisma.list.findUnique({ where: { id: listId }, include: { owner: { select: { username: true } } } });
  if (!list || list.ownerId !== userId) throw new Error("Not found");

  const updated = await prisma.list.update({
    where: { id: listId },
    data: {
      ...(data.title !== undefined ? { title: data.title.trim() || list.title } : {}),
      ...(data.description !== undefined ? { description: data.description.trim() || null } : {}),
      ...(data.public !== undefined ? { public: data.public } : {}),
    },
  });

  revalidateLists(list.owner.username, listId);
  return updated;
}

export async function deleteList(listId: string) {
  const userId = await requireUserId();
  const list = await prisma.list.findUnique({ where: { id: listId }, include: { owner: { select: { username: true } } } });
  if (!list || list.ownerId !== userId) throw new Error("Not found");

  await prisma.list.delete({ where: { id: listId } });

  revalidateLists(list.owner.username);
}

export async function addItemToList(listId: string, itemId: string, note?: string) {
  const userId = await requireUserId();
  const list = await prisma.list.findUnique({ where: { id: listId }, include: { owner: { select: { username: true } } } });
  if (!list || list.ownerId !== userId) throw new Error("Not found");

  const maxPos = await prisma.listItem.aggregate({ where: { listId }, _max: { position: true } });

  await prisma.listItem.upsert({
    where: { listId_itemId: { listId, itemId } },
    update: { ...(note !== undefined ? { note: note.trim() || null } : {}) },
    create: { listId, itemId, note: note?.trim() || null, position: (maxPos._max.position ?? -1) + 1 },
  });

  revalidateLists(list.owner.username, listId);
}

export async function removeItemFromList(listId: string, itemId: string) {
  const userId = await requireUserId();
  const list = await prisma.list.findUnique({ where: { id: listId }, include: { owner: { select: { username: true } } } });
  if (!list || list.ownerId !== userId) throw new Error("Not found");

  await prisma.listItem.deleteMany({ where: { listId, itemId } });

  revalidateLists(list.owner.username, listId);
}

export async function saveList(listId: string) {
  const userId = await requireUserId();
  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: { owner: { select: { username: true } }, items: true },
  });
  if (!list) throw new Error("Not found");
  if (list.ownerId === userId) throw new Error("That's your own list.");

  await prisma.listSave.upsert({
    where: { userId_listId: { userId, listId } },
    update: {},
    create: { userId, listId },
  });

  await Promise.all(
    list.items.map((li) =>
      prisma.libraryEntry.upsert({
        where: { userId_itemId: { userId, itemId: li.itemId } },
        update: {},
        create: { userId, itemId: li.itemId },
      })
    )
  );

  revalidateLists(list.owner.username, listId);
}

export async function unsaveList(listId: string) {
  const userId = await requireUserId();
  const list = await prisma.list.findUnique({ where: { id: listId }, include: { owner: { select: { username: true } } } });
  if (!list) throw new Error("Not found");

  await prisma.listSave.deleteMany({ where: { userId, listId } });

  revalidateLists(list.owner.username, listId);
}
