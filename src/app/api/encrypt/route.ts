import { NextResponse } from 'next/server'
import { apiStatusCodes } from '@/config/CommonConstant'
import crypto from 'crypto'

export const runtime = 'nodejs'

const encryptAES = (text: string, secret: string): string => {
  const salt = crypto.randomBytes(8)

  // OpenSSL EVP_BytesToKey (MD5)
  let key = Buffer.alloc(0) as Buffer
  let prev = Buffer.alloc(0) as Buffer

  while (key.length < 48) {
    const md5 = crypto.createHash('md5')
    md5.update(Buffer.concat([prev, Buffer.from(secret), salt]))
    prev = md5.digest()
    key = Buffer.concat([key, prev])
  }

  const aesKey = key.subarray(0, 32)
  const iv = key.subarray(32, 48)

  const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])

  return Buffer.concat([Buffer.from('Salted__'), salt, encrypted]).toString(
    'base64',
  )
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { CRYPTO_PRIVATE_KEY } = process.env

    if (!CRYPTO_PRIVATE_KEY) {
      throw new Error('Missing CRYPTO_PRIVATE_KEY')
    }

    if (!body?.password) {
      return NextResponse.json(
        { message: 'Value is required' },
        { status: apiStatusCodes.API_STATUS_BAD_REQUEST },
      )
    }

    const encryptedValue = encryptAES(body.password, CRYPTO_PRIVATE_KEY)

    return NextResponse.json(
      { message: 'Value encrypted successfully', data: encryptedValue },
      { status: apiStatusCodes.API_STATUS_SUCCESS },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Encryption failed', error: error.message },
      { status: apiStatusCodes.API_STATUS_SERVER_ERROR },
    )
  }
}
