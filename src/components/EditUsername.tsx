"use client";

import { useState } from "react";
import { updateUsername } from "@/app/actions";

export default function EditUsername({ initial }: { initial: string }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await updateUsername(value);
      setEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
    setSaving(false);
  }

  function cancel() {
    setValue(initial);
    setEditing(false);
  }

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="text-sm text-ink/40 hover:text-ink">
        {initial} <span className="underline">edit</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={24}
        className="px-2 py-1 rounded-lg border text-sm"
        style={{ borderColor: "var(--line)" }}
      />
      <button onClick={save} disabled={saving} className="text-sm text-accent underline">
        Save
      </button>
      <button onClick={cancel} className="text-sm text-ink/40">
        Cancel
      </button>
    </div>
  );
}
