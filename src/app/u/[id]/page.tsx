import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileView from "@/components/ProfileView";

export const dynamic = "force-dynamic";

export default async function FriendProfilePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) notFound();

  const entries = await prisma.libraryEntry.findMany({
    where: { userId: params.id },
    include: { item: true },
    orderBy: { dateAdded: "desc" },
  });

  return <ProfileView user={user} entries={entries} editable={false} isOwn={false} />;
}
