import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { posterColor } from "@/lib/posterColor";
import BookHero from "@/components/BookHero";
import EyeIcon from "@/components/EyeIcon";

export const dynamic = "force-dynamic";

function initialsOf(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function relTime(ts: Date | null) {
  if (!ts) return "";
  const diff = Math.max(0, Date.now() - ts.getTime());
  const day = 86400000;
  const d = Math.floor(diff / day);
  if (d < 1) return "today";
  if (d === 1) return "1 day ago";
  if (d < 14) return `${d} days ago`;
  return `${Math.floor(d / 7)} weeks ago`;
}

export default async function BookPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin");

  const item = await prisma.item.findUnique({ where: { id: params.id } });
  if (!item) notFound();

  const entries = await prisma.libraryEntry.findMany({
    where: { itemId: item.id },
    include: { user: true },
    orderBy: { dateRated: "desc" },
  });

  const yourEntryRaw = entries.find((e) => e.userId === session.user.id) || null;
  const yourEntry = yourEntryRaw
    ? {
        id: yourEntryRaw.id,
        read: yourEntryRaw.read,
        rating: yourEntryRaw.rating,
        reviewText: yourEntryRaw.reviewText,
      }
    : null;

  const allReviews = entries.filter((e) => e.rating != null);
  const yourReview = allReviews.find((e) => e.userId === session.user.id) || null;
  const reviews = yourReview
    ? [yourReview, ...allReviews.filter((e) => e.userId !== session.user.id)]
    : allReviews;
  const avg = allReviews.length ? allReviews.reduce((s, e) => s + (e.rating || 0), 0) / allReviews.length : null;
  const color = posterColor(item.id);

  return (
    <div>
      <div className="flex gap-6 mb-8">
        <div className="relative rounded-md shrink-0 overflow-hidden" style={{ background: color, width: 110, aspectRatio: "5/7" }}>
          {yourEntry && (
            <div
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/70 flex items-center justify-center"
              style={{ color: yourEntry.read ? "#3f6b4a" : "#8c8a80" }}
            >
              <EyeIcon open={yourEntry.read} width={12} height={12} />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h1 className="font-serif text-2xl font-semibold mb-1">{item.title}</h1>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-ink/50 hover:text-accent inline-flex items-center gap-1"
          >
            {item.source} <span>↗</span>
          </a>

          <div className="flex items-center gap-2 mt-4 mb-5">
            {avg != null ? (
              <>
                <div className="flex gap-px">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className="text-lg" style={{ color: Math.round(avg) >= n ? "#c99a3c" : "var(--line)" }}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-ink/40">
                  {avg.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}
                </span>
              </>
            ) : (
              <span className="text-sm text-ink/40">No ratings yet</span>
            )}
          </div>

          <BookHero item={item} yourEntry={yourEntry} />
        </div>
      </div>

      <p className="text-xs uppercase tracking-wide text-ink/40 font-semibold mb-3">Reviews</p>
      {reviews.length === 0 ? (
        <p className="text-sm text-ink/40">No one's reviewed this yet.</p>
      ) : (
        <div>
          {reviews.map((r) => {
            const isOwn = r.userId === session.user.id;
            return (
              <div
                key={r.id}
                className="flex items-start gap-3 py-4 border-b -mx-2 px-2 rounded-lg"
                style={{ borderColor: "var(--line)" }}
              >
                <Link href={`/review/${r.id}`} className="flex items-start gap-3 min-w-0 flex-1 hover:opacity-80">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-serif font-semibold text-xs shrink-0"
                    style={{ background: "#b5502f" }}
                  >
                    {initialsOf(r.user.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {r.user.name}
                        {isOwn ? " (you)" : ""}
                      </span>
                      <div className="flex gap-px">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span key={n} className="text-xs" style={{ color: (r.rating || 0) >= n ? "#c99a3c" : "var(--line)" }}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    {r.reviewText && <p className="text-sm text-ink/70 mt-1 line-clamp-2">{r.reviewText}</p>}
                    <div className="text-xs text-ink/40 mt-1">{relTime(r.dateRated)}</div>
                  </div>
                </Link>
                {isOwn && (
                  <Link
                    href={`/review/${r.id}?edit=1`}
                    aria-label="Edit your review"
                    className="w-7 h-7 flex items-center justify-center rounded-full text-ink/40 hover:text-ink hover:bg-bg shrink-0"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
