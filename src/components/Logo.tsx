export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="holo" x1="8" y1="8" x2="56" y2="56">
          <stop stopColor="#59a3ff" />
          <stop offset="0.5" stopColor="#5eead4" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="16" stroke="url(#holo)" strokeWidth="2" />
      <circle cx="32" cy="26" r="10" stroke="url(#holo)" strokeWidth="2" />
      <path d="M18 46h28" stroke="url(#holo)" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 46v6M32 46v8M40 46v6" stroke="#3380ff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
