import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignOutButton from "./SignOutButton";
import NavLinks from "./NavLinks";

function initialsOf(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default async function TopNav() {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-20 bg-bg border-b" style={{ borderColor: "var(--line)" }}>
      <div className="max-w-4xl mx-auto px-7 py-3 flex items-center gap-7">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" stroke="#20201d" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 27L16 4" />
            <path d="M23 27C24 17 17 12 14 10L9.5 7" />
          </svg>
          <h1 className="font-serif text-lg font-semibold m-0">Reed</h1>
        </Link>

        {session && <NavLinks />}

        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {session?.user ? (
            <>
              <Link
                href="/profile"
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-serif font-semibold text-[13px]"
                style={{ background: "#b5502f" }}
              >
                {initialsOf(session.user.name)}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link href="/signin" className="px-4 py-2 rounded-lg bg-ink text-white text-sm font-medium">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
