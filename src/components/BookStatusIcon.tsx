type Props = { read: boolean; width?: number; height?: number };

export default function BookStatusIcon({ read, width = 16, height = 16 }: Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {read && <rect x="4" y="3" width="16" height="13.5" rx="2" stroke="none" fill="currentColor" fillOpacity={0.32} />}
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M4 16.5h16" />
    </svg>
  );
}
