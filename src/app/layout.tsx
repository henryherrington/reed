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
      </body>
    </html>
  );
}
