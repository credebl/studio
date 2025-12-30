import { JwtPayload, jwtDecode } from 'jwt-decode'
import { Session, SessionOptions, User } from 'next-auth'

import CredentialsProvider from 'next-auth/providers/credentials'
import { JWT } from 'next-auth/jwt'
import { Provider } from 'next-auth/providers/index'
import { apiRoutes } from '@/config/apiRoutes'
import { passwordEncryption } from '@/app/api/server/encryption'

type PasskeyUser = {
  userName: string
  email?: string
}
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
    redirect({
      url,
      baseUrl,
    }: {
      url: string
      baseUrl: string
    }): Promise<string>
  }
  secret?: string
  session?: Partial<SessionOptions>
  pages?: { signIn: string }
  cookies?: {
    sessionToken: {
      name: string
      options: {
        domain?: string
        path: string
        sameSite: 'lax' | 'strict' | 'none'
        secure: boolean
        httpOnly: boolean
      }
    }
  }
}

interface JwtDataPayload extends JwtPayload {
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
        isPassword: { label: 'isPassword', type: 'boolean' },
        obj: { label: 'obj', type: 'string' },
        verifyAuthenticationObj: {
          label: 'verifyAuthenticationObj',
          type: 'string',
        },
      },
      async authorize(credentials, req) {
        let parsedVerifyAuthObj: Record<string, unknown> = {}
        let parsedObj: PasskeyUser = { userName: '' }
        const ua = req?.headers?.['user-agent'] || undefined
        let clientIp =
          req?.headers?.['x-forwarded-for']?.split(',')[0] || undefined
        if (clientIp && clientIp.startsWith('::ffff:')) {
          clientIp = clientIp.substring(7)
        }
        try {
          const {
            email,
            password,
            isPasskey,
            isPassword,
            verifyAuthenticationObj,
            obj,
          } = credentials || {}
          let sanitizedPayload = {}
          if (isPassword) {
            sanitizedPayload = {
              email,
              password: passwordEncryption(JSON.stringify(password) || ''),
              isPasskey,
            }
          } else {
            try {
              parsedVerifyAuthObj = JSON.parse(verifyAuthenticationObj || '{}')
              parsedObj = JSON.parse(obj || '{}')
            } catch (err) {
              console.error('Failed to parse incoming JSON strings:', err)
              return null
            }
            sanitizedPayload = {
              ...parsedVerifyAuthObj,
            }
          }
          // eslint-disable-next-line init-declarations
          let res
          if (isPassword) {
            res = await fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}${apiRoutes.auth.sinIn}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'User-Agent': ua,
                  'x-forwarded-for': clientIp,
                },
                body: JSON.stringify(sanitizedPayload),
                credentials: 'include',
              },
            )
          } else if (obj) {
            res = await fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}/${apiRoutes.auth.fidoVerifyAuthentication}${parsedObj.userName}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'User-Agent': ua,
                  'x-forwarded-for': clientIp,
                },
                body: JSON.stringify(sanitizedPayload),
              },
            )
          }

          const responseData = await res?.json()

          if (!res?.ok) {
            throw new Error(responseData.message || 'Invalid credentials')
          }

          const user = responseData
          if (user.statusCode === 200 && user.data) {
            const decodedToken = jwtDecode<JwtDataPayload>(
              user.data.access_token,
            )

            if (!decodedToken?.email) {
              return null
            }

            return {
              id: user.data.session_state || user.data.email,
              sessionId: user.data.sessionId,
            }
          }

          return null
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message)
          }
          throw new Error(JSON.stringify({ message: 'Authorize error' }))
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }): Promise<JWT> {
      if (user) {
        token.sessionId = user.sessionId
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
      session.sessionId = token.sessionId as string
      return session
    },

    async redirect({ url, baseUrl }) {
      try {
        const redirectUrl = new URL(url, baseUrl)

        const cookieDomain = process.env.NEXTAUTH_COOKIE_DOMAIN?.replace(
          /^\./,
          '',
        )
        const isAllowed =
          cookieDomain &&
          redirectUrl.hostname.endsWith(cookieDomain) &&
          ['http:', 'https:'].includes(redirectUrl.protocol)

        if (isAllowed) {
          return redirectUrl.toString()
        }
      } catch (err) {
        console.error('Redirect error:', err)
        return new URL(url, baseUrl).toString()
      }

      return baseUrl
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/sign-in',
  },

  cookies: {
    sessionToken: {
      name:
        process.env.NEXTAUTH_PROTOCOL === 'http'
          ? 'next-auth.session-token'
          : '__Secure-next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NEXTAUTH_PROTOCOL !== 'http',
        domain: process.env.NEXTAUTH_COOKIE_DOMAIN,
      },
    },
  },
}
