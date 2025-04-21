import OverViewPage from '@/features/dashboard/components/dashboard';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard'
};

export default async function DashboardPage() {
  const session = await auth();

  // if (!session?.user) {
  //   redirect('/auth/sign-in');
  // }

  return <OverViewPage />;
}
