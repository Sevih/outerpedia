// src/app/api/tenant/route.ts
import { NextResponse } from 'next/server'
import { getTenantServer } from '@/tenants/tenant.server'

export const dynamic = 'force-dynamic' // évite le cache en dev

export async function GET() {
  try {
    const t = await getTenantServer()
    return NextResponse.json(t)
  } catch {
    return NextResponse.json({ error: 'failed-to-resolve-tenant' }, { status: 500 })
  }
}
