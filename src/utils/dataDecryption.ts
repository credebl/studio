export const dataDecryption = async (
  value: string,
): Promise<string> => {
  try {
    const res = await fetch('/api/decrypt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ encryptedToken: value }),
    })
    const responseData = await res.json()
    const decrypted = responseData.data
    return decrypted
  } catch (error) {
    console.error('Failed to fetch session details:', error)
    throw error
  }
}