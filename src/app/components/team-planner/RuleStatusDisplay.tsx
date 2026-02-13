'use client'

import React from 'react'
import Image from 'next/image'
import type { RuleStatus, RuleCategory } from '@/types/team-planner'
import { CATEGORY_LABELS, RULES_BY_CATEGORY } from '@/lib/team-planner/ruleConfig'

interface RuleStatusDisplayProps {
  ruleStatuses: RuleStatus[]
}

// Map rule icon paths to actual image paths
function getRuleIconPath(icon: string | undefined): string | null {
  if (!icon) return null

  // element/fire → /images/ui/elem/fire.webp
  if (icon.startsWith('element/')) {
    return `/images/ui/elem/${icon.replace('element/', '')}.webp`
  }
  // class/striker → /images/ui/class/striker.webp
  if (icon.startsWith('class/')) {
    return `/images/ui/class/${icon.replace('class/', '')}.webp`
  }
  // buff/*, debuff/*, utility/*, role/* → /images/ui/effect/*
  // For now, return null - these icons may not exist yet
  return null
}

function StatusIcon({ severity, passed }: { severity: RuleStatus['severity']; passed: boolean }) {
  if (severity === 'info') {
    return (
      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </span>
    )
  }

  if (passed) {
    return (
      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-green-500/20 text-green-400">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    )
  }

  if (severity === 'error') {
    return (
      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-red-500/20 text-red-400">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    )
  }

  // warning
  return (
    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    </span>
  )
}

export default function RuleStatusDisplay({ ruleStatuses }: RuleStatusDisplayProps) {
  if (ruleStatuses.length === 0) return null

  // Group by category maintaining config order
  const categoryOrder = Object.keys(RULES_BY_CATEGORY) as RuleCategory[]
  const grouped = categoryOrder
    .map(category => ({
      category,
      statuses: ruleStatuses.filter(rs => rs.rule.category === category),
    }))
    .filter(g => g.statuses.length > 0)

  // Summary counts
  const passedCount = ruleStatuses.filter(rs => rs.passed && rs.severity !== 'info').length
  const totalNonInfo = ruleStatuses.filter(rs => rs.severity !== 'info').length

  return (
    <div className="mt-4 space-y-3">
      {/* Summary bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              passedCount === totalNonInfo ? 'bg-green-500' :
              passedCount > 0 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: totalNonInfo > 0 ? `${(passedCount / totalNonInfo) * 100}%` : '0%' }}
          />
        </div>
        <span className={`text-sm font-medium ${
          passedCount === totalNonInfo ? 'text-green-400' :
          passedCount > 0 ? 'text-amber-400' : 'text-red-400'
        }`}>
          {passedCount}/{totalNonInfo}
        </span>
      </div>

      {/* Rules by category */}
      {grouped.map(({ category, statuses }) => (
        <div key={category}>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
            {CATEGORY_LABELS[category] ?? category}
          </div>
          <div className="space-y-1">
            {statuses.map(rs => {
              const iconPath = getRuleIconPath(rs.metadata.icon)
              return (
                <div
                  key={rs.rule.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                    rs.severity === 'info' ? 'bg-blue-900/10' :
                    rs.passed ? 'bg-green-900/10' :
                    rs.severity === 'error' ? 'bg-red-900/10' : 'bg-amber-900/10'
                  }`}
                >
                  <StatusIcon severity={rs.severity} passed={rs.passed} />
                  {iconPath && (
                    <Image
                      src={iconPath}
                      alt=""
                      width={16}
                      height={16}
                      className="flex-shrink-0"
                    />
                  )}
                  <span className={`text-sm ${
                    rs.severity === 'info' ? 'text-blue-300' :
                    rs.passed ? 'text-gray-300' :
                    rs.severity === 'error' ? 'text-red-300' : 'text-amber-300'
                  }`}>
                    {rs.metadata.label}
                  </span>
                  {rs.rule.value != null && (
                    <span className="text-xs text-gray-500">({rs.rule.value})</span>
                  )}
                  {rs.severity === 'info' && rs.matchedBy.length > 0 && (
                    <span className="text-xs text-blue-400 ml-auto">
                      {rs.matchedBy.length}/4
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
