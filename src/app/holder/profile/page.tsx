import UserProfile from '@/features/profile/components/UserProfile'
import { requireHolderSession } from '@/lib/server/holder'

export const metadata = {
  title: 'Holder Profile',
}

export default async function HolderProfilePage(): Promise<React.JSX.Element> {
  await requireHolderSession()

  return <UserProfile />
}
