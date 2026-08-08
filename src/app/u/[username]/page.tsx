import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileView from "@/components/ProfileView";

export const dynamic = "force-dynamic";

export default async function FriendProfilePage({ params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");

  const user = await prisma.user.findUnique({ where: { username: params.username } });
  if (!user) notFound();

  if (user.id === session.user.id) redirect("/profile");

  const [entries, follow] = await Promise.all([
    prisma.libraryEntry.findMany({
      where: { userId: user.id },
      include: { item: true },
      orderBy: { dateAdded: "desc" },
    }),
    prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: session.user.id, followingId: user.id } },
    }),
  ]);

  return <ProfileView user={user} entries={entries} editable={false} isOwn={false} isFollowing={!!follow} />;
}
