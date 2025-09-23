export interface Session {
  id: string
  sessionToken: string
  userId: string
  expires: number
  refreshToken: string
  createdAt: string
  updatedAt: string
  accountId: string
  sessionType: string
  expiresAt: string
  clientInfo: clientInfo
}

export interface clientInfo {
  os: string
  browser: string
  deviceType: string
  rawDetail: string
  ip: string
}
