import { NextRequest, NextResponse } from 'next/server'

import {
  getPlatformAdminSession,
  getPlatformInvitations,
} from '@/lib/server/admin'

export const dynamic = 'force-dynamic'

const MAX_PAGE_SIZE = 50
const MAX_SEARCH_LENGTH = 100

const toBoundedInt = (
  value: string | null,
  fallback: number,
  min: number,
  max: number,
): number => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return fallback
  }

  return Math.min(max, Math.max(min, Math.trunc(parsed)))
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await getPlatformAdminSession())) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = request.nextUrl
  const page = toBoundedInt(searchParams.get('page'), 1, 1, 10_000)
  const pageSize = toBoundedInt(
    searchParams.get('pageSize'),
    10,
    1,
    MAX_PAGE_SIZE,
  )
  const search = (searchParams.get('search') ?? '').slice(0, MAX_SEARCH_LENGTH)

  const invitations = await getPlatformInvitations({ page, pageSize, search })

  return NextResponse.json(invitations, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
