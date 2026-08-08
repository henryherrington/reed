"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createList } from "@/app/actions";

export default function NewListButton({ username }: { username: string }) {
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  async function create() {
    setCreating(true);
    try {
      const list = await createList("Untitled list", "", true);
      router.push(`/u/${username}/lists/${list.id}?edit=1`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
      setCreating(false);
    }
  }

  return (
    <button onClick={create} disabled={creating} className="px-4 py-2 rounded-lg bg-ink text-white text-sm font-medium">
      + New list
    </button>
  );
}
