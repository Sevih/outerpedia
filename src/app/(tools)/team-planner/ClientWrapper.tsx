'use client'

import dynamic from 'next/dynamic'

const TeamPlannerWrapper = dynamic(() => import('./TeamPlannerWrapper'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-gray-400">Loading...</div>
    </div>
  ),
})

export default TeamPlannerWrapper
