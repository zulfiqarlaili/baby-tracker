type IconName =
  | 'baby'
  | 'calendar'
  | 'chevron-left'
  | 'chevron-right'
  | 'clock'
  | 'download'
  | 'heart'
  | 'home'
  | 'more-horizontal'
  | 'share'
  | 'sparkle'
  | 'undo'
  | 'upload'
  | 'x'

interface IconProps {
  name: IconName
  size?: number
  className?: string
}

const paths: Record<IconName, React.ReactNode> = {
  baby: (
    <>
      <path d="M9.2 5.7a3 3 0 0 1 5.6 0" />
      <path d="M8 8.2c0-2.4 1.8-4.2 4-4.2s4 1.8 4 4.2c0 1.8-.9 3.1-2.1 4.2" />
      <path d="M10.1 12.4A4.7 4.7 0 0 0 7 16.8C7 19.1 9.2 21 12 21s5-1.9 5-4.2a4.7 4.7 0 0 0-3.1-4.4" />
      <path d="M9.7 15.7h.01M14.3 15.7h.01M10.5 18c.8.6 2.2.6 3 0" />
    </>
  ),
  calendar: (
    <>
      <rect width="18" height="18" x="3" y="4" rx="3" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  'chevron-left': <path d="m15 18-6-6 6-6" />,
  'chevron-right': <path d="m9 18 6-6-6-6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </>
  ),
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10M9 20v-6h6v6" />
    </>
  ),
  'more-horizontal': (
    <>
      <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  share: (
    <>
      <path d="M12 16V3M7 8l5-5 5 5" />
      <path d="M5 12v8h14v-8" />
    </>
  ),
  sparkle: <path d="m12 2 1.7 5.1L19 9l-5.3 1.9L12 16l-1.7-5.1L5 9l5.3-1.9L12 2ZM5 16l.8 2.2L8 19l-2.2.8L5 22l-.8-2.2L2 19l2.2-.8L5 16Z" />,
  undo: (
    <>
      <path d="M9 7 5 11l4 4" />
      <path d="M5 11h8a6 6 0 0 1 6 6" />
    </>
  ),
  upload: (
    <>
      <path d="M12 21V9M7 14l5-5 5 5" />
      <path d="M5 3h14" />
    </>
  ),
  x: <path d="m7 7 10 10M17 7 7 17" />,
}

export function Icon({ name, size = 24, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {paths[name]}
    </svg>
  )
}
