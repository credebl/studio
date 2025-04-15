import { Metadata } from 'next';
import SignUpViewPage from '@/features/auth/components/sigup-view';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.'
};

export default async function Page() {

  return <SignUpViewPage  />;
}
