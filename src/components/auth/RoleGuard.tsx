"use client";

import { useAuth } from '@/providers/AuthProvider';
import { useUserRole } from '@/hooks/useUserRole';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('citizen' | 'mp_staff' | 'admin')[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function RoleGuard({ children, allowedRoles, fallback, redirectTo = '/' }: RoleGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, hasRole } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        router.push('/auth/signin');
      } else if (role && !hasRole(allowedRoles)) {
        router.push(redirectTo);
      }
    }
  }, [user, role, authLoading, roleLoading, allowedRoles, redirectTo, router, hasRole]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user || !role || !hasRole(allowedRoles)) {
    return fallback || null;
  }

  return <>{children}</>;
}
