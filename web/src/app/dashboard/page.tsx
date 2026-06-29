"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import DashboardView from '@/components/DashboardView';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const setCurrentTab = (tab: string) => {
    if (tab === 'dashboard') {
      router.push('/dashboard');
    } else {
      router.push(`/dashboard/${tab}`);
    }
  };
  
  const userAny = user as any;

  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.role === 'EMPLOYEE') {
            return parsed.branch?.id || null;
          }
        } catch (e) {}
      }
      const stored = localStorage.getItem('selectedBranchId');
      if (stored !== null && stored !== '') {
        return parseInt(stored);
      }
    }
    return null;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (userAny?.role === 'EMPLOYEE') {
        setSelectedBranchId(userAny?.branch?.id || null);
      } else {
        const stored = localStorage.getItem('selectedBranchId');
        if (stored === null || stored === '') {
          const defaultBranchId = userAny?.branch?.id || null;
          setSelectedBranchId(defaultBranchId);
        }
      }
    }
  }, [userAny]);

  return (
    <div className="animate-slide-up">
      <DashboardView 
        setCurrentTab={setCurrentTab} 
        selectedBranchId={selectedBranchId} 
      />
    </div>
  );
}
