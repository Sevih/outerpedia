import { NextResponse } from 'next/server';
import { getTenant } from '@/tenants/tenant';

export async function GET() {
  const t = await getTenant();
  return NextResponse.json(t);
}
