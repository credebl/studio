export const dateConversion = (date: string): string => {
  const newDate = new Date(date)
  const now = new Date()
  let diffInSeconds = Math.floor((newDate.getTime() - now.getTime()) / 1000)

  // Expired already → show "ago"
  if (diffInSeconds < 0) {
    diffInSeconds = Math.abs(diffInSeconds)

    if (diffInSeconds < 60) {
      return diffInSeconds === 1 ? 'A second ago' : `${diffInSeconds} sec ago`
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return diffInMinutes === 1
        ? 'A minute ago'
        : `${diffInMinutes} minutes ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return diffInHours === 1 ? 'An hour ago' : `${diffInHours} hours ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return diffInDays === 1 ? 'Yesterday' : `${diffInDays} days ago`
    }

    return newDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    })
  }

  // Still in future → show "in ..."
  if (diffInSeconds < 60) {
    return diffInSeconds === 1 ? 'After a second' : `After ${diffInSeconds} sec`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return diffInMinutes === 1
      ? 'After a minute'
      : `After ${diffInMinutes} minutes`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return diffInHours === 1 ? 'After an hour' : `After ${diffInHours} hours`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return diffInDays === 1 ? 'Tomorrow' : `After ${diffInDays} days`
  }

  return newDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
