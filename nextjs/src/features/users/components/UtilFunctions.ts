export const getStatuses = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'status-pending'
    case 'accepted':
      return 'status-accepted'
    default:
      return 'status-rejected'
  }
}
