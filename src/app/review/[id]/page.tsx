import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReviewView from "@/components/ReviewView";

export const dynamic = "force-dynamic";

export default async function ReviewPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");

  const entry = await prisma.libraryEntry.findUnique({
    where: { id: params.id },
    include: { item: true, user: true },
  });

  if (!entry || entry.rating == null) notFound();

  return (
    <ReviewView
      entryId={entry.id}
      rating={entry.rating}
      reviewText={entry.reviewText}
      dateRated={entry.dateRated ? entry.dateRated.toISOString() : null}
      reviewerName={entry.user.name}
      item={{ id: entry.item.id, title: entry.item.title, url: entry.item.url, source: entry.item.source }}
      isOwn={entry.userId === session.user.id}
    />
  );
}
