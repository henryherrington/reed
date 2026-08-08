"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { followUser, unfollow } from "@/app/actions";

export default function FollowButton({ targetUserId, initialFollowing }: { targetUserId: string; initialFollowing: boolean }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    const next = !following;
    setFollowing(next);
    startTransition(async () => {
      try {
        if (next) await followUser(targetUserId);
        else await unfollow(targetUserId);
        router.refresh();
      } catch (err) {
        setFollowing(!next);
        alert(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      className={`text-sm px-4 py-1.5 rounded-lg border ${following ? "text-ink/50" : "bg-ink text-white border-ink"}`}
      style={{ borderColor: following ? "var(--line)" : undefined }}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
