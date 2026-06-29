"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { useRouter, usePathname } from 'next/navigation';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { CelebrationProvider } from '@/components/providers/CelebrationProvider';
import { branchService } from '@/services/api';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const userAny = user as any;
  const [branches, setBranches] = useState<any[]>([]);

  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selectedBranchId');
      if (stored !== null) {
        return stored === '' ? null : parseInt(stored);
      }
    }
    return userAny?.branch?.id || null;
  });

  useEffect(() => {
    async function loadBranches() {
      try {
        const list = await branchService.getAll();
        setBranches(list);
      } catch (err) {
        console.error('Failed to load branches in layout', err);
      }
    }
    if (user) {
      loadBranches();
    }
  }, [user]);

  useEffect(() => {
    if (userAny && userAny.status === 'SUSPENDED') {
      logout();
      alert('Your account has been suspended. Access to the dashboard is restricted.');
    }
  }, [userAny, logout]);

  const handleSelectBranch = (id: number | null) => {
    if (id === null) {
      localStorage.setItem('selectedBranchId', '');
    } else {
      localStorage.setItem('selectedBranchId', id.toString());
    }
    setSelectedBranchId(id);
    window.location.reload();
  };

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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) return null;

  return (
    <ToastProvider>
      <CelebrationProvider>
        <div className="flex h-screen overflow-hidden bg-slate-50">
          {/* Mobile backdrop */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden transition-opacity"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          <Sidebar 
            currentTab={currentTab} 
            setCurrentTab={setCurrentTab}
            branchName={userAny.branch ? userAny.branch.name : 'SuperMart HQ'}
            branches={branches}
            selectedBranchId={selectedBranchId}
            setSelectedBranchId={handleSelectBranch}
            currentUser={userAny}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar 
              onLogout={logout} 
              user={user} 
              setCurrentTab={setCurrentTab} 
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            />
            <div className="flex-1 overflow-y-auto bg-slate-50 relative z-0 p-4 lg:p-8">
              <div className="max-w-[1600px] mx-auto w-full animate-slide-up">
                {children}
              </div>
            </div>
          </div>
        </div>
      </CelebrationProvider>
    </ToastProvider>
  );
}
