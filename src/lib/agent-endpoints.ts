export const MAX_AGENT_ENDPOINT_LENGTH = 2048

/**
 * Agent endpoints are stored by the platform as a base URL only. Studio rejects
 * credentials, query strings, fragments and sub-paths so the value can be used
 * safely for both `/agent/token` and the base-wallet configuration request.
 */
export const isValidAgentEndpoint = (value: string): boolean => {
  try {
    const url = new URL(value)
    return (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      Boolean(url.hostname) &&
      (url.pathname === '' || url.pathname === '/') &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    )
  } catch {
    return false
  }
}
