'use client';

import React, { useEffect, useState } from 'react';
import { authService, branchService } from '../services/api';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import LoginView from '../components/LoginView';
import DashboardView from '../components/DashboardView';
import EmployeesView from '../components/EmployeesView';
import PayrollView from '../components/PayrollView';
import PaymentsView from '../components/PaymentsView';
import PayslipsView from '../components/PayslipsView';
import AttendanceView from '../components/AttendanceView';
import AdvancesView from '../components/AdvancesView';
import BranchesView from '../components/BranchesView';
import PlaceholderView from '../components/PlaceholderView';

export default function HomePage() {
  const [user, setUser] = useState<any | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  useEffect(() => {
    // Check if token exists in localStorage
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
      loadBranches();
    }
    setCheckedAuth(true);
  }, []);

  async function loadBranches() {
    try {
      const data = await branchService.getAll();
      setBranches(data);
    } catch (error) {
      console.error('Failed to load branches for dropdown:', error);
    }
  }

  const handleLoginSuccess = (loggedInUser: any) => {
    setUser(loggedInUser);
    loadBranches();
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (!checkedAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-bold">
        Initializing SmartPay Workspace...
      </div>
    );
  }

  if (!user) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Render correct content view based on active tab
  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView setCurrentTab={setCurrentTab} selectedBranchId={selectedBranchId} />;
      case 'employees':
        return <EmployeesView selectedBranchId={selectedBranchId} />;
      case 'payroll':
        return <PayrollView selectedBranchId={selectedBranchId} currentUser={user} />;
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
        return <PlaceholderView title="Analytical Reports" />;
      case 'notifications':
        return <PlaceholderView title="Notifications Center" />;
      case 'settings':
        return <PlaceholderView title="Company Settings" />;
      case 'roles':
        return <PlaceholderView title="Roles & Permissions" />;
      default:
        return <DashboardView setCurrentTab={setCurrentTab} selectedBranchId={selectedBranchId} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab}
        branchName={user.branch ? user.branch.name : 'SuperMart HQ'}
        branches={branches}
        selectedBranchId={selectedBranchId}
        setSelectedBranchId={setSelectedBranchId}
      />

      {/* Main Dashboard Space */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onLogout={handleLogout} user={user} />
        {renderContent()}
      </div>
    </div>
  );
}
