import {
  getPlatformInvitations,
  requirePlatformAdmin,
} from '@/lib/server/admin'
import { InvitationsPanel } from './invitations-panel'

export const metadata = {
  title: 'Admin Invitations',
}

export default async function AdminInvitationsPage(): Promise<React.JSX.Element> {
  await requirePlatformAdmin()
  const initialPage = await getPlatformInvitations({ page: 1 })

  return <InvitationsPanel initialPage={initialPage} />
}
