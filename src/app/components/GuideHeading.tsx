type GuideHeadingProps = {
    level?: 2| 3 | 4
    children: React.ReactNode
    className?: string
  }
  
  export default function GuideHeading({ level = 3, children, className = '' }: GuideHeadingProps) {
    const base = 'mb-2 mt-6 pl-3 border-l font-semibold'
    const styles =
      level === 3
        ? `text-xl text-sky-300 border-l-4 border-sky-500 font-bold`
        : level === 2 ? "text-2xl font-bold mb-4 text-sky-500 border-l-4 border-sky-500" : `text-base text-white/90 border-l-2 border-sky-400`
  
    const finalClass = `${base} ${styles} ${className}`
  
    if (level === 2) return <h2 className={finalClass}>{children}</h2>
    if (level === 3) return <h3 className={finalClass}>{children}</h3>
    return <h4 className={finalClass}>{children}</h4>
  }
  