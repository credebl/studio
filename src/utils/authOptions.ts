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

const PLATFORM_ADMIN_ROLE = 'platform_admin'

interface PlatformAccess {
  isPlatformAdmin: boolean
  hasOrgAccess: boolean
}

/**
 * Resolves which consoles the signed-in user may use.
 *
 * `platform_admin` grants the platform console. Any other org role (owner,
 * admin, issuer, verifier, member, …) grants the organization console, so a
 * person holding both roles can switch between the two shells.
 *
 * Runs server-side only (authorize is never bundled for the browser) and fails
 * closed: returns null when the profile lookup cannot be completed so callers
 * can decide whether to treat the user as a non-admin.
 */
const resolvePlatformAccess = async (
  accessToken: string,
): Promise<PlatformAccess | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}${apiRoutes.users.userProfile}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      },
    )

    if (!response.ok) {
      return null
    }

    const body = await response.json()
    const roles = body?.data?.userOrgRoles

    if (!Array.isArray(roles)) {
      return { isPlatformAdmin: false, hasOrgAccess: false }
    }

    const roleNames = roles
      .map((item: { orgRole?: { name?: string } }) => item?.orgRole?.name)
      .filter((name): name is string => Boolean(name))

    return {
      isPlatformAdmin: roleNames.includes(PLATFORM_ADMIN_ROLE),
      hasOrgAccess: roleNames.some((name) => name !== PLATFORM_ADMIN_ROLE),
    }
  } catch {
    return null
  }
}

/**
 * Resolves the console claims for a session minted before the claims existed,
 * by exchanging the httpOnly sessionId for an access token.
 * Returns null when the lookup could not be completed so the claims can be
 * retried on a later request instead of being cached as a false negative.
 */
const resolvePlatformAccessFromSessionId = async (
  sessionId: string,
): Promise<PlatformAccess | null> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  if (!baseUrl) {
    return null
  }

  try {
    // The platform decrypts with JSON.parse, so the session id must be
    // JSON-encoded before encryption.
    const encryptedSessionId = passwordEncryption(JSON.stringify(sessionId))
    const response = await fetch(
      `${baseUrl}${apiRoutes.auth.fetchSessionDetails}?sessionId=${encodeURIComponent(encryptedSessionId)}`,
      { cache: 'no-store' },
    )

    if (!response.ok) {
      return null
    }

    const body = await response.json()
    const accessToken = body?.data?.sessionToken

    return accessToken ? resolvePlatformAccess(accessToken) : null
  } catch {
    return null
  }
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
            const accessToken = user.data.access_token as string
            const decodedToken = jwtDecode<JwtDataPayload>(accessToken)

            if (!decodedToken?.email) {
              return null
            }

            const access = await resolvePlatformAccess(accessToken)

            return {
              id: user.data.session_state || user.data.email,
              sessionId: user.data.sessionId,
              isPlatformAdmin: access?.isPlatformAdmin ?? false,
              hasOrgAccess: access?.hasOrgAccess ?? false,
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
        token.isPlatformAdmin = Boolean(user.isPlatformAdmin)
        token.hasOrgAccess = Boolean(user.hasOrgAccess)
        return token
      }

      // Sessions minted before these claims existed are resolved once and then
      // persisted, so the navigation appears without a forced re-login.
      if (
        typeof token.sessionId === 'string' &&
        (typeof token.isPlatformAdmin !== 'boolean' ||
          typeof token.hasOrgAccess !== 'boolean')
      ) {
        const access = await resolvePlatformAccessFromSessionId(token.sessionId)
        if (access !== null) {
          token.isPlatformAdmin = access.isPlatformAdmin
          token.hasOrgAccess = access.hasOrgAccess
        }
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
      session.isPlatformAdmin = Boolean(token.isPlatformAdmin)
      session.hasOrgAccess = Boolean(token.hasOrgAccess)
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
