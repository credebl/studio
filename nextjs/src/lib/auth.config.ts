import CredentialProvider from 'next-auth/providers/credentials'
import { NextAuthConfig } from 'next-auth'
// import GithubProvider from 'next-auth/providers/github';
// import GoogleProvider from 'next-auth/providers/google';

const authConfig = {
  providers: [
    // GithubProvider({}),
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    // }),
    CredentialProvider({
      credentials: {
        email: {
          type: 'email',
        },
        password: {
          type: 'password',
        },
      },
      async authorize(credentials) {
        const user = {
          id: '',
          name: '',
          email: credentials?.email as string,
        }
        if (user) {
          return user
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: '/auth/sign-in',
  },
} satisfies NextAuthConfig

export default authConfig
