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
    isActive: true,

    items: [
      {
        title: 'Issue',
        url: '/credentials',
        icon: 'userPen',
        shortcut: ['m', 'm'],
      },
      {
        title: 'Verify',
        shortcut: ['l', 'l'],
        url: '/verification',
        icon: 'login',
      },
    ],
  },
  {
    title: 'Trust',
    url: '#', // Placeholder as there is no direct link for the parent
    icon: 'billing',
    isActive: true,

    items: [
      {
        title: 'x509',
        shortcut: ['l', 'l'],
        url: '/x509-certificate',
        icon: 'login',
      },
    ],
  },
	{
    title: 'Ecosystems',
    url: '/ecosystems',
    icon: 'world',
    isActive: false,
    shortcut: ['e', 'e'],
    items: [], // no child items
  },
,
]

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
