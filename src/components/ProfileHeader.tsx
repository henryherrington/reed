import Link from "next/link";
import EditUsername from "./EditUsername";
import FollowButton from "./FollowButton";

function initialsOf(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function ProfileHeader({
  user,
  isOwn,
  isFollowing,
  readCount,
  libraryCount,
  savedHref,
}: {
  user: { id: string; name: string | null; username: string | null };
  isOwn: boolean;
  isFollowing?: boolean;
  readCount: number;
  libraryCount: number;
  savedHref: string;
}) {
  return (
    <div>
      {!isOwn && (
        <Link href="/activity" className="text-sm text-ink/40 hover:text-ink mb-3.5 inline-block">
          ← Back
        </Link>
      )}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-serif font-semibold text-xl"
            style={{ background: "#b5502f" }}
          >
            {initialsOf(user.name)}
          </div>
          <div>
            <h2 className="text-xl font-semibold m-0">
              {user.name}
              {isOwn ? " (you)" : ""}
            </h2>
            {isOwn ? (
              <EditUsername initial={user.username || ""} />
            ) : (
              <p className="text-sm text-ink/40 m-0">{user.username}</p>
            )}
            <Link href={savedHref} className="text-sm text-ink/40 hover:text-ink mt-1 inline-block">
              {readCount} read · {libraryCount} in library
            </Link>
          </div>
        </div>
        {!isOwn && <FollowButton targetUserId={user.id} initialFollowing={!!isFollowing} />}
      </div>
    </div>
  );
}
