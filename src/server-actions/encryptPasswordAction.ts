'use server'

import { passwordEncryption } from '@/app/api/server/encryption'

export async function encryptPasswordAction(password: string): Promise<string> {
  return passwordEncryption(password)
}
