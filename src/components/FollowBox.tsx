"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { followByEmail, unfollow } from "@/app/actions";

export default function FollowBox({ following }: { following: { id: string; name: string }[] }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleFollow() {
    if (!email.trim()) return;
    setBusy(true);
    try {
      await followByEmail(email.trim());
      setEmail("");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
    setBusy(false);
  }

  async function handleUnfollow(id: string) {
    setBusy(true);
    try {
      await unfollow(id);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
    setBusy(false);
  }

  return (
    <div className="mb-6 p-4 rounded-xl bg-white" style={{ boxShadow: "inset 0 0 0 1px var(--line)" }}>
      <div className="flex gap-2 mb-3">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Follow a friend by their Google email"
          className="flex-1 px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: "var(--line)" }}
        />
        <button onClick={handleFollow} disabled={busy} className="px-4 py-2 rounded-lg bg-ink text-white text-sm font-medium">
          Follow
        </button>
      </div>
      {following.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {following.map((f) => (
            <span
              key={f.id}
              className="text-xs px-2.5 py-1 rounded-full bg-bg flex items-center gap-1.5"
              style={{ boxShadow: "inset 0 0 0 1px var(--line)" }}
            >
              {f.name}
              <button onClick={() => handleUnfollow(f.id)} className="text-ink/40 hover:text-accent">
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <p className="text-[11px] text-ink/40 mt-2">They need to have signed in to Reed at least once for this to work.</p>
    </div>
  );
}
