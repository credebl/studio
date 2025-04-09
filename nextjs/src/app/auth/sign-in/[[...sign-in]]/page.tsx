import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sign-in-view';

export const metadata: Metadata = {
 title: 'CREDEBL - Studio',
  description: 'CREDEBL - Studio with Next.js and Shadcn'
};

export default async function Page() {
 
  return <SignInViewPage />;
}
