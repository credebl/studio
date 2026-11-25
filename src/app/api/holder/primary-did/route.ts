import { NextRequest, NextResponse } from 'next/server'

import { getPrimaryDidUrl } from '@/lib/server/holder'
import { holderErrorResponse } from '../routeHelpers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const orgId = request.nextUrl.searchParams.get('orgId') ?? ''
    const didUrl = await getPrimaryDidUrl(orgId)

    return NextResponse.json(
      { didUrl },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    return holderErrorResponse(error)
  }
}
