"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createList } from "@/app/actions";

export default function NewListButton({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function create() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const list = await createList(title, description, isPublic);
      setOpen(false);
      setTitle("");
      setDescription("");
      router.push(`/u/${username}/lists/${list.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
    setSaving(false);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="px-4 py-2 rounded-lg bg-ink text-white text-sm font-medium">
        + New list
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl p-7 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">New list</h2>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full px-3 py-2 rounded-lg border text-sm mb-3"
              style={{ borderColor: "var(--line)" }}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border text-sm resize-none mb-3"
              style={{ borderColor: "var(--line)" }}
            />
            <label className="flex items-center gap-2 text-sm text-ink/60 mb-5">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              Public — visible on your profile
            </label>
            <div className="flex justify-end gap-2.5">
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--line)" }}>
                Cancel
              </button>
              <button onClick={create} disabled={saving || !title.trim()} className="px-4 py-2 rounded-lg text-sm bg-ink text-white">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
