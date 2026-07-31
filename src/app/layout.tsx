import type { Metadata } from "next";
import "./globals.css";
import TopNav from "@/components/TopNav";

export const metadata: Metadata = {
  title: "Reed",
  description: "A library for the articles and papers you actually mean to read.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen flex flex-col">
        <TopNav />
        <main className="max-w-4xl mx-auto px-7 py-6 pb-20 flex-1 w-full">{children}</main>
        <footer className="text-center pb-8">
          <span className="text-xs text-ink/30">
            Made by{" "}
            <a
              href="https://henry-websites.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-ink/60"
            >
              henry websites
            </a>
          </span>
        </footer>
      </body>
    </html>
  );
}
