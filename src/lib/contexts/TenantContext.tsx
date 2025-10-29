'use client'
import { createContext, useContext } from 'react'
import type { TenantKey } from '@/tenants/config'

export type TenantCtx = { key: TenantKey; domain: string }
const Ctx = createContext<TenantCtx | null>(null)
export const useTenant = () => {
  const v = useContext(Ctx)
  if (!v) throw new Error('TenantContext not provided')
  return v
}
export function TenantProvider({ value, children }: { value: TenantCtx; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
