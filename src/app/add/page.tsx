import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AddSearch from "@/components/AddSearch";

export const dynamic = "force-dynamic";

export default async function AddPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");

  const myLib = await prisma.libraryEntry.findMany({ where: { userId: session.user.id }, select: { itemId: true } });

  return <AddSearch myItemIds={myLib.map((e) => e.itemId)} />;
}
