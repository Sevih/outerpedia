'use client'

import GuideTemplate from '@/app/components/GuideTemplate'

export default function BeginnerFAQ() {
  return (
    <GuideTemplate
      title="초보자 FAQ"
      introduction="한국어 버전은 준비 중입니다. 영어 버전을 참조하세요."
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
