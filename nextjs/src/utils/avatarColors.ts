export const getRandomAvatarColor = (
  seed: string,
): { bg: string; text: string } => {
  const colors = [
    { bg: 'bg-avatar-1', text: 'text-avatar-1' },
    { bg: 'bg-avatar-2', text: 'text-avatar-2' },
    { bg: 'bg-avatar-3', text: 'text-avatar-3' },
    { bg: 'bg-avatar-4', text: 'text-avatar-4' },
    { bg: 'bg-avatar-5', text: 'text-avatar-5' },
    { bg: 'bg-avatar-6', text: 'text-avatar-6' },
    { bg: 'bg-avatar-7', text: 'text-avatar-7' },
    { bg: 'bg-avatar-8', text: 'text-avatar-8' },
  ]

  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }

  const index = Math.abs(hash) % colors.length
  return colors[index]
}
