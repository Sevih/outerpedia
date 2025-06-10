'use client'

import { Copy } from 'lucide-react'
import { useState } from 'react'

export default function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={copyToClipboard}
      className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
    >
      <Copy size={16} />
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}
