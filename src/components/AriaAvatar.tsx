interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  xs: 'h-5 w-5 text-[9px]',
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
}

export function AriaAvatar({ size = 'sm', className = '' }: Props) {
  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/25 ring-2 ring-purple-500/20 ${className}`}
    >
      <span className="font-bold text-white leading-none">A</span>
    </div>
  )
}
