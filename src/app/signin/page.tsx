"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      <h2 className="font-serif text-2xl font-semibold">Welcome to Reed</h2>
      <p className="text-ink/60 max-w-sm">Your library for the articles, papers, and posts you keep meaning to read.</p>
      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="px-5 py-2.5 rounded-lg bg-ink text-white text-sm font-medium"
      >
        Sign in with Google
      </button>
    </div>
  );
}
