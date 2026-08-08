type Props = { open: boolean; width?: number; height?: number };

export default function EyeIcon({ open, width = 16, height = 16 }: Props) {
  if (open) {
    return (
      <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    );
  }
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12.5c3 3 6.5 4.5 10 4.5s7-1.5 10-4.5" />
      <path d="M7 16.5l-1.2 2M12 17.5v2.2M17 16.5l1.2 2" />
    </svg>
  );
}
