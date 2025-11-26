type GuideHeadingProps = {
  level?: 2 | 3 | 4
  children: React.ReactNode
  className?: string
}

export default function GuideHeading({ level = 3, children, className = '' }: GuideHeadingProps) {
  const config = {
    2: {
      wrapper: 'mb-4 mt-8 py-2 px-4',
      text: 'text-2xl font-bold tracking-wide',
      bar: 'h-full w-1',
      glow: 'shadow-[0_0_20px_rgba(14,165,233,0.6)]',
      gradient: 'from-sky-400 to-cyan-300',
      textColor: 'text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-200 to-sky-300',
      bg: 'bg-gradient-to-r from-sky-950/50 via-sky-900/30 to-transparent',
      border: 'border-l-0 rounded-r-lg',
    },
    3: {
      wrapper: 'mb-3 mt-6 py-1.5 px-3',
      text: 'text-xl font-bold tracking-wide',
      bar: 'h-full w-1',
      glow: 'shadow-[0_0_15px_rgba(14,165,233,0.5)]',
      gradient: 'from-sky-400 via-cyan-400 to-sky-400',
      textColor: 'text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-cyan-200',
      bg: 'bg-gradient-to-r from-sky-950/40 via-sky-900/20 to-transparent',
      border: 'border-l-0 rounded-r-md',
    },
    4: {
      wrapper: 'mb-2 mt-4 py-1 px-2',
      text: 'text-base font-semibold',
      bar: 'h-full w-0.5',
      glow: 'shadow-[0_0_10px_rgba(14,165,233,0.4)]',
      gradient: 'from-sky-500/80 to-sky-400/80',
      textColor: 'text-sky-200/90',
      bg: 'bg-gradient-to-r from-sky-950/30 to-transparent',
      border: 'border-l-0 rounded-r-sm',
    },
  }

  const c = config[level]

  const content = (
    <div className={`relative flex items-center gap-3 ${c.wrapper} ${c.bg} ${c.border} ${className}`}>
      {/* Barre verticale avec gradient et glow */}
      <div
        className={`absolute left-0 top-0 ${c.bar} rounded-full bg-gradient-to-b ${c.gradient} ${c.glow}`}
        aria-hidden="true"
      />
      {/* Texte */}
      <span className={`${c.text} ${c.textColor} drop-shadow-[0_0_10px_rgba(14,165,233,0.3)]`}>
        {children}
      </span>
    </div>
  )

  if (level === 2) return <h2>{content}</h2>
  if (level === 3) return <h3>{content}</h3>
  return <h4>{content}</h4>
}
