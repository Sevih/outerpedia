'use client'

export default function PatchedHtml({ html }: { html: string }) {
  return (
    <div
      className="prose prose-invert mt-3 max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
