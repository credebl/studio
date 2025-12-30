// src/app/api/auth/[...nextauth]/route.ts
export const runtime = 'nodejs'

import NextAuth from 'next-auth/next'
import { authOptions } from '@/utils/authOptions'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
