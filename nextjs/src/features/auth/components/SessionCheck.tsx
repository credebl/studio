'use client';

import React, { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks';

interface SessionProps {
  children: ReactNode;
}

const sessionExcludedPaths = ['/auth/sign-in', '/auth/sign-up','/auth/verify-email-success'];
const signInPath = '/auth/sign-in';
const dashboardPath = '/dashboard/overview';

const SessionCheck: React.FC<SessionProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const token = useAppSelector((state) => (state as any).auth.token);

  const checkSession = (): void => {
    const isExcluded = sessionExcludedPaths.some((path) =>
      pathname?.startsWith(path)
    );

    if (!token && !isExcluded) {
      router.push(signInPath);
    } else if (token && pathname === signInPath) {
      router.push(dashboardPath);
    }
  };

  useEffect(() => {
    checkSession();
  }, [pathname]);

  return <>{children}</>;
};

export default SessionCheck;
