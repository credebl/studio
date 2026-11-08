import type { Session } from 'next-auth'

export const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export const makeSession = (overrides: Partial<Session> = {}): Session => ({
  expires: '2099-01-01T00:00:00.000Z',
  user: { id: 'user-1', name: 'Admin' },
  sessionId: 'session-1',
  isPlatformAdmin: true,
  ...overrides,
})
