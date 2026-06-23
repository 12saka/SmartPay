"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { isAuthenticated, hasRole, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Basic delay to prevent flash of content during initial mount reading localStorage
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      router.push('/');
    } else if (allowedRoles && user && !hasRole(allowedRoles)) {
      router.push('/dashboard'); // fallback for unauthorized
    }
  }, [isAuthenticated, user, allowedRoles, router]);

  if (!isAuthenticated) {
    return null; // Or a loading skeleton
  }

  if (allowedRoles && user && !hasRole(allowedRoles)) {
    return null;
  }

  return <>{children}</>;
}
