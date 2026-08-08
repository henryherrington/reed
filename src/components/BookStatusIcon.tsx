type Props = { read: boolean; width?: number; height?: number };

export default function BookStatusIcon({ read, width = 16, height = 16 }: Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={read ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.5 3H20v18H6.5A2.5 2.5 0 0 1 4 18.5v-13A2.5 2.5 0 0 1 6.5 3Z" />
      <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" fill="none" />
    </svg>
  );
}
