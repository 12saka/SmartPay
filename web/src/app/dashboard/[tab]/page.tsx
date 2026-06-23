"use client";

import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useParams } from 'next/navigation';

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
  const tab = params.tab as string;

  // Next.js TS strictly checks user properties. We cast to any to bypass the missing 'branch' property on the User type
  const userAny = user as any;
  const selectedBranchId = userAny?.branch?.id || null;

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
      return <PayslipsView selectedBranchId={selectedBranchId} />;
    case 'attendance':
      return <AttendanceView />;
    case 'advances':
      return <AdvancesView selectedBranchId={selectedBranchId} />;
    case 'branches':
      return <BranchesView />;
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
      return <SettingsView />;
    case 'wallet':
    case 'finance':
      return <WalletView />;
    case 'profile':
      return <ProfileView />;
    case 'approvals':
      return <PlaceholderView title="Approvals" />;
    default:
      return <PlaceholderView title="Under Construction" />;
  }
}
