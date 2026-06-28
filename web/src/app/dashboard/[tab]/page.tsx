"use client";

import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useParams, useRouter } from 'next/navigation';
import BranchDetailsView from '@/components/BranchDetailsView';

import EmployeesView from '@/components/EmployeesView';
import PayrollView from '@/components/PayrollView';
import PaymentsView from '@/components/PaymentsView';
import PayslipsView from '@/components/PayslipsView';
import AttendanceView from '@/components/AttendanceView';
import AdvancesView from '@/components/AdvancesView';
import BranchesView from '@/components/BranchesView';
import ReportsView from '@/components/ReportsView';
import ComplianceView from '@/components/ComplianceView';
import NotificationsView from '@/components/NotificationsView';
import AuditLogsView from '@/components/AuditLogsView';
import SettingsView from '@/components/SettingsView';
import WalletView from '@/components/WalletView';
import ProfileView from '@/components/ProfileView';
import PlaceholderView from '@/components/PlaceholderView';

export default function TabPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const tab = params.tab as string;

  const setCurrentTab = (tab: string) => {
    if (tab === 'dashboard') {
      router.push('/dashboard');
    } else {
      router.push(`/dashboard/${tab}`);
    }
  };

  const handleSelectBranch = (id: number | null) => {
    if (typeof window !== 'undefined') {
      if (id === null) {
        localStorage.setItem('selectedBranchId', '');
      } else {
        localStorage.setItem('selectedBranchId', id.toString());
      }
      window.location.reload();
    }
    setSelectedBranchId(id);
  };

  // Next.js TS strictly checks user properties. We cast to any to bypass the missing 'branch' property on the User type
  const userAny = user as any;

  const [selectedBranchId, setSelectedBranchId] = React.useState<number | null>(() => {
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

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (typeof window !== 'undefined' && userAny?.role !== 'EMPLOYEE') {
      const stored = localStorage.getItem('selectedBranchId');
      if (stored !== null && stored !== '') {
        setSelectedBranchId(parseInt(stored));
      } else {
        setSelectedBranchId(null);
      }
    }
  }, [tab, userAny]);

  switch (tab) {
    case 'employees':
      return <EmployeesView selectedBranchId={selectedBranchId} />;
    case 'payroll-processing':
    case 'payroll':
      return <PayrollView selectedBranchId={selectedBranchId} currentUser={user} />;
    case 'bulk-payments':
    case 'payments':
      return <PaymentsView selectedBranchId={selectedBranchId} />;
    case 'payslips':
      return <PayslipsView selectedBranchId={selectedBranchId} currentUser={user} />;
    case 'my-attendance':
    case 'attendance':
      return <AttendanceView currentUser={user} />;
    case 'request-advance':
    case 'advances':
      return <AdvancesView selectedBranchId={selectedBranchId} currentUser={user} />;
    case 'branches':
      return (
        <BranchesView 
          selectedBranchId={selectedBranchId}
          setSelectedBranchId={handleSelectBranch}
          setCurrentTab={setCurrentTab}
        />
      );
    case 'branch-details':
      return (
        <BranchDetailsView 
          selectedBranchId={selectedBranchId}
          setCurrentTab={setCurrentTab}
          currentUser={user}
        />
      );
    case 'reports':
      return <ReportsView />;
    case 'compliance':
      return <ComplianceView />;
    case 'notifications':
      return <NotificationsView />;
    case 'audit-logs':
    case 'audit':
      return <AuditLogsView />;
    case 'settings':
      return <SettingsView currentUser={user} />;
    case 'wallet':
    case 'finance':
      return <WalletView />;
    case 'profile-settings':
    case 'profile':
      return <ProfileView currentUser={user} />;
    case 'approvals':
      return <PlaceholderView title="Approvals" />;
    default:
      return <PlaceholderView title="Under Construction" />;
  }
}
