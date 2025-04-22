'use client';

import React, { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks';
import { sessionExcludedPaths } from '@/config/CommonConstant';

interface SessionProps {
  children: ReactNode;
}

const signInPath = '/auth/sign-in';
const dashboardPath = '/dashboard';

const SessionCheck: React.FC<SessionProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const token = useAppSelector((state) => state.auth.token);

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
  }, [pathname, token]);

  return <>{children}</>;
};

export default SessionCheck;
