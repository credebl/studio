import CryptoJS from 'crypto-js'
import { NextResponse } from 'next/server'
import { apiStatusCodes } from '@/config/CommonConstant'

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { CRYPTO_PRIVATE_KEY } = process.env

    if (!CRYPTO_PRIVATE_KEY) {
      throw new Error('Missing CRYPTO_PRIVATE_KEY')
    }

    if(!body?.encryptedToken) {
      return NextResponse.json(
        { message: 'Value is required' },
        { status: apiStatusCodes.API_STATUS_BAD_REQUEST },
      )
    }

    const encryptedToken = body.encryptedToken

    const bytes = CryptoJS.AES.decrypt(encryptedToken, CRYPTO_PRIVATE_KEY)

    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return NextResponse.json(
      { message: 'Value decrypted successfully', data: decryptedData },
      { status: apiStatusCodes.API_STATUS_SUCCESS },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error encrypting value', error)
    return NextResponse.json(
      { message: 'Encryption failed', error: error.message },
      { status: apiStatusCodes.API_STATUS_SERVER_ERROR },
    )
  }
}
