import { NavItem } from '../../types'

export type Product = {
  photo_url: string
  name: string
  description: string
  created_at: string
  price: number
  id: number
  category: string
  updated_at: string
}

// Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [], // Empty array as there are no child items for Dashboard
  },
  {
    title: 'Wallet',
    url: '/wallet',
    icon: 'wallet',
    shortcut: ['w', 'w'],
    isActive: false,
    items: [],
  },
  {
    title: 'Connections',
    url: '/connections',
    icon: 'connections',
    shortcut: ['k', 'k'],
    isActive: false,
    items: [], // No child items
  },
  {
    title: 'Credentials',
    url: '#', // Placeholder as there is no direct link for the parent
    icon: 'billing',
    items: [
      {
        title: 'Issued credentials',
        url: '/credentials',
        icon: 'page',
        shortcut: ['c', 'c'],
        description: 'View credentials already issued by your organization.',
        match: 'exact',
      },
      {
        title: 'Issue via DIDComm',
        url: '/credentials/issue',
        icon: 'userPen',
        shortcut: ['i', 'i'],
        description:
          'W3C credential issuance over DIDComm via connection, email, or bulk.',
        match: 'prefix',
      },
      {
        title: 'Verify via DIDComm',
        url: '/verification',
        icon: 'login',
        shortcut: ['v', 'v'],
        description: 'W3C proof requests over DIDComm.',
        match: 'prefix',
      },
      {
        title: 'OID4VC issuance',
        url: '/oid4vc/issuers',
        icon: 'add',
        shortcut: ['o', 'i'],
        description:
          'OpenID4VCI: manage issuers, templates, and credential offers.',
        match: 'prefix',
        matchPaths: ['/oid4vc/create-issuer'],
        // Reserve ['o', 'v'] for the upcoming OID4VP verification flow.
      },
    ],
  },
  {
    title: 'x509 certificates',
    url: '/x509-certificate',
    icon: 'login',
    shortcut: ['x', 'x'],
    description: 'Manage x509 certificates.',
    isActive: false,
    items: [],
  },
]

const normalizePath = (path: string): string => path.replace(/\/+$/, '') || '/'

const matchesPath = (
  pathname: string,
  url: string,
  match: NavItem['match'],
): boolean => {
  const currentPath = normalizePath(pathname)
  const targetPath = normalizePath(url)

  if (match === 'exact') {
    return currentPath === targetPath
  }

  return (
    currentPath === targetPath ||
    currentPath.startsWith(targetPath === '/' ? '/' : `${targetPath}/`)
  )
}

export const isNavItemActive = (pathname: string, item: NavItem): boolean => {
  if (item.url === '#') {
    return false
  }

  return [item.url, ...(item.matchPaths ?? [])].some((url) =>
    matchesPath(pathname, url, item.match),
  )
}

export const getActiveNavGroup = (
  items: NavItem[],
  pathname: string,
): string | undefined =>
  items.find((item) =>
    item.items?.some((subItem) => isNavItemActive(pathname, subItem)),
  )?.title

// Only injected into the sidebar for users holding the platform_admin role.
export const adminNavItem: NavItem = {
  title: 'Admin',
  url: '/admin',
  icon: 'settings',
  isActive: false,
  shortcut: ['a', 'a'],
  items: [],
}

// Injected into the organization sidebar for users with the holder capability.
export const holderNavItem: NavItem = {
  title: 'My Wallet',
  url: '/holder',
  icon: 'wallet',
  isActive: false,
  shortcut: ['h', 'h'],
  items: [],
}

export interface saleuser {
  id: number
  name: string
  email: string
  amount: string
  image: string
  initials: string
}

export const recentsalesdata: saleuser[] = [
  {
    id: 1,
    name: 'olivia martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'om',
  },
  {
    id: 2,
    name: 'jackson lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'jl',
  },
  {
    id: 3,
    name: 'isabella nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'in',
  },
  {
    id: 4,
    name: 'william kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'wk',
  },
  {
    id: 5,
    name: 'sofia davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'sd',
  },
]
