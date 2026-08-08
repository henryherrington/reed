"use client";

import { useEffect, useState } from "react";

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Greeting({
  name,
  upNextCount,
  hasLibrary,
}: {
  name: string;
  upNextCount: number;
  hasLibrary: boolean;
}) {
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    setGreeting(timeGreeting());
  }, []);

  const subtitle =
    upNextCount > 0
      ? "Here's what's up next."
      : hasLibrary
      ? "You're all caught up — nice work."
      : "Let's find your first read.";

  return (
    <div className="mb-8">
      <h1 className="font-serif text-3xl font-semibold mb-1.5">
        {greeting || "Hi"}, {name}.
      </h1>
      <p className="text-ink/50">{subtitle}</p>
    </div>
  );
}
