import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileView from "@/components/ProfileView";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/signin");

  const entries = await prisma.libraryEntry.findMany({
    where: { userId: session.user.id },
    include: { item: true },
    orderBy: { dateAdded: "desc" },
  });

  return <ProfileView user={user} entries={entries} editable isOwn />;
}
