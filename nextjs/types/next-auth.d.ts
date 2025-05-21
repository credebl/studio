import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    user: User
  }

  interface User {
    id: string
    email: string
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    email?: string
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
  }
}
