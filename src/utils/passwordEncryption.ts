export const passwordValueEncryption = async (
  value: string,
): Promise<string> => {
  try {
    const res = await fetch('/api/encrypt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: JSON.stringify(value) }),
    })
    const responseData = await res.json()
    const encrypted = responseData.data
    return encrypted
  } catch (error) {
    console.error('Failed to fetch session details:', error)
    throw error
  }
}
