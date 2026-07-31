"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/signin" })} className="text-xs text-ink/50 hover:text-ink">
      Sign out
    </button>
  );
}
