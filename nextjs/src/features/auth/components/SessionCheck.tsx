'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks';
import { sessionExcludedPaths } from '@/config/CommonConstant';
import Loader from '@/components/Loader';

interface SessionProps {
  children: ReactNode;
}

const signInPath = '/auth/sign-in';
const dashboardPath = '/dashboard';

const SessionCheck: React.FC<SessionProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAppSelector((state) => state.auth.token);

  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const isExcluded = sessionExcludedPaths.some((path) =>
      pathname?.startsWith(path)
    );

    if (!token && !isExcluded) {
      router.push(signInPath);
    } else if (token && pathname === signInPath) {
      router.push(dashboardPath);
    }

    setCheckingSession(false);
  }, [pathname, token, router]);

  if (checkingSession) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader height='2rem' width='2rem' />
      </div>
    );
  }

  return <>{children}</>;
};

export default SessionCheck;
