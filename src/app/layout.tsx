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
      <body className="font-sans">
        <TopNav />
        <main className="max-w-4xl mx-auto px-7 py-6 pb-20">{children}</main>
        <footer className="text-center pb-8">
          <a
            href="https://henry-websites.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-ink/30 hover:text-ink/60"
          >
            Made by henry websites
          </a>
        </footer>
      </body>
    </html>
  );
}
