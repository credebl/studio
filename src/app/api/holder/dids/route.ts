import { NextRequest, NextResponse } from 'next/server'

import { getHolderDidUrls } from '@/lib/server/holder'
import { holderErrorResponse } from '../routeHelpers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const orgId = request.nextUrl.searchParams.get('orgId') ?? ''
    const dids = await getHolderDidUrls(orgId)

    return NextResponse.json(
      { dids },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    return holderErrorResponse(error)
  }
}
