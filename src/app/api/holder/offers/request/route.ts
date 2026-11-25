import {
  holderErrorResponse,
  parseHolderCredentialRequest,
  readJsonBody,
} from '../../routeHelpers'
import { NextResponse } from 'next/server'
import { requestCredential } from '@/lib/server/holder'

export const dynamic = 'force-dynamic'

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const payload = parseHolderCredentialRequest(await readJsonBody(request))
    const result = await requestCredential(payload)

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    return holderErrorResponse(error)
  }
}
