import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    user: User
    sessionId?: string
    isPlatformAdmin?: boolean
  }

  interface User {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    sessionId?: string
    isPlatformAdmin?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    email?: string
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    isPlatformAdmin?: boolean
  }
}
