'use client'

import { redirect } from 'next/navigation'

export default function Home(): void {
  redirect('/auth/sign-in')
}
