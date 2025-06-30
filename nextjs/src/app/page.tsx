'use client'

import { redirect } from 'next/navigation'

export default function Home(): void {
  redirect('/sign-in')
}
