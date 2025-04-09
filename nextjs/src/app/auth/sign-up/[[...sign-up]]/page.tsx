import { Metadata } from 'next';
import SignUpViewPage from '@/features/auth/components/sign-up-view';

export const metadata: Metadata = {
  title: 'CREDEBL - Studio',
  description: 'CREDEBL - Studio with Next.js and Shadcn'
};

export default async function Page() {
 
  return <SignUpViewPage />;
}
