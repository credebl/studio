import { holderErrorResponse, readJsonBody } from '../../routeHelpers'
import { NextResponse } from 'next/server'
import { resolveCredentialOffer } from '@/lib/server/holder'

export const dynamic = 'force-dynamic'

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await readJsonBody(request)
    const credentialOfferUri =
      typeof body?.credentialOfferUri === 'string'
        ? body.credentialOfferUri
        : ''
    const offer = await resolveCredentialOffer(credentialOfferUri)

    return NextResponse.json(offer, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    return holderErrorResponse(error)
  }
}
