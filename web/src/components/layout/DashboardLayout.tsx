"use client";

import React, { useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import { useRouter, usePathname } from 'next/navigation';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Extract current tab from pathname, e.g. /dashboard/employees -> 'employees'
  const pathParts = pathname.split('/').filter(Boolean);
  const currentTab = pathParts.length > 1 ? pathParts[1] : 'dashboard';

  // Navigate when sidebar tab is clicked
  const setCurrentTab = (tab: string) => {
    if (tab === 'dashboard') {
      router.push('/dashboard');
    } else {
      router.push(`/dashboard/${tab}`);
    }
  };

  const userAny = user as any;
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(userAny?.branch?.id || null);

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab}
        branchName={userAny.branch ? userAny.branch.name : 'SuperMart HQ'}
        branches={[]} // branches could be fetched here if needed, or fetched inside Sidebar
        selectedBranchId={selectedBranchId}
        setSelectedBranchId={setSelectedBranchId}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onLogout={logout} user={user} setCurrentTab={setCurrentTab} />
        <div className="flex-1 overflow-y-auto bg-slate-50 relative z-0 p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
