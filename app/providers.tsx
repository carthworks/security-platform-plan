'use client';

import { AuthProvider } from '@/lib/auth';
import { StoreProvider } from '@/lib/store';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import UserBar from '@/components/UserBar';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/ThemeToggle';
import { ToastProvider } from '@/components/Toast';

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = pathname === '/login' || pathname === '/';

  if (isPublicRoute) return <>{children}</>;

  return (
    <>
      <Navbar />
      <UserBar />
      {children}
      <footer className="footer">
        <p>© 2025 securityPlatform · Project Management & Build Tracker</p>
      </footer>
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <StoreProvider>
            <AuthGuard>
              <AppShell>{children}</AppShell>
            </AuthGuard>
          </StoreProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
