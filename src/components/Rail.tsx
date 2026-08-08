export default function Rail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p className="text-xs uppercase tracking-wide text-ink/40 font-semibold mb-3">{title}</p>
      <div className="flex gap-4 overflow-x-auto pb-1 -mx-1 px-1">{children}</div>
    </div>
  );
}
