import { emailRegex } from '../config/CommonConstant'

export const TextTitlecase = (text: string): string => {
  const roles = text.split(',')

  const capitalizedWords = roles.map(
    (role) => role.trim().charAt(0).toUpperCase() + role.trim().slice(1),
  )

  const result = capitalizedWords.join(', ')

  return result
}

export const copyText = (copiedText: string | undefined): void => {
  if (copiedText) {
    navigator.clipboard.writeText(copiedText).catch((error) => {
      console.error('Failed to copy text: ', error)
    })
  }
}

// To check validity of email
export const validEmail = (email: string): string =>
  (emailRegex.test(email) ? email : '')
