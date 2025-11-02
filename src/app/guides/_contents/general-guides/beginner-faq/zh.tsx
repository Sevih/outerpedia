'use client'

import GuideTemplate from '@/app/components/GuideTemplate'

export default function BeginnerFAQ() {
  return (
    <GuideTemplate
      title="常见问题"
      introduction="中文版本正在准备中。请参阅英文版本。"
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
