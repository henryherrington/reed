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
    <p className="mb-8 text-lg text-ink/70">
      {greeting || "Hi"}, {name}. {subtitle}
    </p>
  );
}
