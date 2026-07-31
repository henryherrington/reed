"use client";

import { useState } from "react";
import { rateItem } from "@/app/actions";

export default function RateModal({
  title,
  entryId,
  initialRating,
  onClose,
}: {
  title: string;
  entryId: string;
  initialRating: number | null;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState(initialRating || 0);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!selected) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await rateItem(entryId, selected);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5" onClick={onClose}>
      <div className="bg-white rounded-2xl p-7 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-center text-lg font-semibold mb-1">Rate it</h2>
        <p className="text-center text-sm text-ink/50 mb-3">{title}</p>
        <div className="flex justify-center gap-1.5 my-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              onClick={() => setSelected(n)}
              className="text-3xl cursor-pointer"
              style={{ color: selected >= n ? "#c99a3c" : "var(--line)" }}
            >
              ★
            </span>
          ))}
        </div>
        <div className="flex justify-center gap-2.5 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--line)" }}>
            Skip
          </button>
          <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg text-sm bg-ink text-white">
            Save rating
          </button>
        </div>
      </div>
    </div>
  );
}
