import type { Icons } from '@/components/icons'

export type AdminNavItem = {
  title: string
  url: string
  icon: keyof typeof Icons
}

export type AdminNavGroup = {
  label: string
  items: AdminNavItem[]
}

/**
 * Platform-admin navigation, grouped by purpose. Only pages that exist are
 * listed; new platform-wide pages (organizations, ledgers) belong in Platform.
 */
export const adminNavGroups: AdminNavGroup[] = [
  {
    label: 'Overview',
    items: [{ title: 'Dashboard', url: '/admin', icon: 'dashboard' }],
  },
  {
    label: 'Platform',
    items: [
      {
        title: 'Platform settings',
        url: '/admin/platform-settings',
        icon: 'settings',
      },
      { title: 'Cloud wallets', url: '/admin/cloud-wallet', icon: 'wallet' },
      { title: 'Service status', url: '/admin/status', icon: 'activity' },
    ],
  },
  {
    label: 'Ecosystem',
    items: [
      { title: 'Invitations', url: '/admin/invitations', icon: 'mail' },
      { title: 'Ecosystem settings', url: '/admin/settings', icon: 'world' },
    ],
  },
]

/** The dashboard is the parent of every admin page, so it matches exactly. */
export const isAdminNavActive = (pathname: string, url: string): boolean => {
  if (url === '/admin') {
    return pathname === '/admin'
  }

  return pathname === url || pathname.startsWith(`${url}/`)
}

export const adminPageTitles = [
  { prefix: '/admin/platform-settings', title: 'Platform settings' },
  { prefix: '/admin/cloud-wallet', title: 'Cloud wallets' },
  { prefix: '/admin/status', title: 'Service status' },
  { prefix: '/admin/invitations', title: 'Invitations' },
  { prefix: '/admin/settings', title: 'Ecosystem settings' },
  { prefix: '/admin', title: 'Dashboard' },
]
