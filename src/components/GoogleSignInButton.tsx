"use client";

import { signIn } from "next-auth/react";

export default function GoogleSignInButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="px-5 py-2.5 rounded-lg bg-ink text-white text-sm font-medium"
    >
      Sign in with Google
    </button>
  );
}
