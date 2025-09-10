export interface session {
  id: string
  sessionToken: string
  userId: string
  expires: number
  refreshToken: string
  createdAt: Date
  updatedAt: Date
  accountId: string
  sessionType: string
  expiresAt: Date
}
