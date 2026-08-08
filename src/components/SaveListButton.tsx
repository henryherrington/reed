"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveList, unsaveList } from "@/app/actions";

export default function SaveListButton({ listId, initialSaved }: { listId: string; initialSaved: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      try {
        if (next) await saveList(listId);
        else await unsaveList(listId);
        router.refresh();
      } catch (err) {
        setSaved(!next);
        alert(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <button
      onClick={toggle}
      className={`px-4 py-2 rounded-lg text-sm font-medium border ${saved ? "text-ink/50" : "bg-ink text-white border-ink"}`}
      style={{ borderColor: saved ? "var(--line)" : undefined }}
    >
      {saved ? "Saved to your library ✓" : "Save this list"}
    </button>
  );
}
