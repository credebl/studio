import { JwtPayload, jwtDecode } from 'jwt-decode'
import { Session, SessionOptions, User } from 'next-auth'

import CredentialsProvider from 'next-auth/providers/credentials'
import { JWT } from 'next-auth/jwt'
import { Provider } from 'next-auth/providers/index'
import { apiRoutes } from '@/config/apiRoutes'
import { envConfig } from '@/config/envConfig'

interface MyAuthOptions {
  providers: Provider[]
  callbacks?: {
    jwt({ token, user }: { token: JWT; user?: User }): Promise<JWT>
    session({
      session,
      token,
    }: {
      session: Session
      token: JWT
    }): Promise<Session>
  }
  secret?: string
  session?: Partial<SessionOptions> | undefined
  pages?: { signIn: string }
}

interface jwtDataPayload extends JwtPayload {
  email?: string
  name?: string
}

export const authOptions: MyAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'email@example.com',
        },
        password: { label: 'Password', type: 'password' },
        isPasskey: { label: 'IsPasskey', type: 'boolean' },
      },
      async authorize(credentials) {
        try {
          const { email, password, isPasskey } = credentials || {}

          const sanitizedPayload = {
            email,
            password,
            isPasskey,
          }

          const res = await fetch(
            `${envConfig.NEXT_PUBLIC_BASE_URL}${apiRoutes.auth.sinIn}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(sanitizedPayload),
            },
          )

          if (!res.ok) {
            console.error('Error fetching user:', res.statusText)
            return null
          }

          const user = await res.json()

          if (user.statusCode === 200 && user.data) {
            const decodedToken = jwtDecode<jwtDataPayload>(
              user.data.access_token,
            )

            if (!decodedToken?.email) {
              return null
            }

            return {
              id: user.data.session_state || user.data.email,
              email: decodedToken?.email,
              name: decodedToken?.name || decodedToken?.email,
              accessToken: user.data.access_token,
              refreshToken: user.data.refresh_token,
              tokenType: user.data.token_type,
              expiresAt: user.data.expires_in,
            }
          }

          return null
        } catch (error) {
          console.error('Authorize error:', error)
          return null
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }): Promise<JWT> {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.accessToken = user.accessToken || ''
        token.expiresAt = user.expiresAt
        token.refreshToken = user.refreshToken
      }
      return token
    },

    async session({
      session,
      token,
    }: {
      session: Session
      token: JWT
    }): Promise<Session> {
      session.user = {
        id: token.id as string,
        email: token.email as string,
      }
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      session.expiresAt = token.expiresAt
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/auth/sign-in',
  },
}
