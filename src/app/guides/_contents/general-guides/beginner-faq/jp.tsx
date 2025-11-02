'use client'

import GuideTemplate from '@/app/components/GuideTemplate'

export default function BeginnerFAQ() {
  return (
    <GuideTemplate
      title="初心者向けFAQ"
      introduction="日本語版は準備中です。英語版をご覧ください。"
      defaultVersion="default"
      versions={{
        default: {
          label: 'FAQ',
          content: (
            <p className="text-center text-gray-400 py-8">
              Coming soon...
            </p>
          ),
        },
      }}
    />
  )
}
