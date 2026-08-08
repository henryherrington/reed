import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/");

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      <h2 className="font-serif text-2xl font-semibold">Welcome to Reed</h2>
      <p className="text-ink/60 max-w-sm">Your library for the articles, papers, and posts you keep meaning to read.</p>
      <GoogleSignInButton />
    </div>
  );
}
