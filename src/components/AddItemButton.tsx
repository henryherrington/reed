"use client";

import { useState } from "react";
import { addItem } from "@/app/actions";

export default function AddItemButton() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim() || !url.trim()) {
      alert("Add a title and a link.");
      return;
    }
    setSaving(true);
    try {
      await addItem(title.trim(), url.trim());
      setOpen(false);
      setTitle("");
      setUrl("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
    setSaving(false);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="px-4 py-2 rounded-lg bg-ink text-white text-sm font-medium">
        + Add
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl p-7 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Add to your library</h2>
            <div className="mb-3.5">
              <label className="block text-xs font-medium text-ink/60 mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Attention Is All You Need"
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: "var(--line)" }}
              />
            </div>
            <div className="mb-3.5">
              <label className="block text-xs font-medium text-ink/60 mb-1">Link</label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: "var(--line)" }}
              />
            </div>
            <div className="flex justify-end gap-2.5 mt-5">
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--line)" }}>
                Cancel
              </button>
              <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg text-sm bg-ink text-white">
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
