'use client';

import { useAuth } from '@/lib/auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user && pathname !== '/login' && pathname !== '/') {
      router.replace('/login');
    }
  }, [user, isLoading, pathname, router]);

  // Show nothing while checking auth
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: 'var(--color-text-tertiary)',
        fontSize: 13,
        gap: 8,
      }}>
        <i className="ti ti-loader-2 spin" />
        Loading…
      </div>
    );
  }

  // If on login or landing page, don't wrap with dashboard guards
  if (pathname === '/login' || pathname === '/') {
    return <>{children}</>;
  }

  // If not logged in, don't render (redirect happening)
  if (!user) return null;

  return <>{children}</>;
}
