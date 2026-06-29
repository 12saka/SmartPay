import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileSpreadsheet, 
  CreditCard, 
  CheckSquare, 
  GitBranch, 
  CalendarClock, 
  HandCoins, 
  Wallet, 
  BarChart3, 
  FileCheck, 
  Bell, 
  Activity, 
  Settings, 
  ChevronDown
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  branchName: string;
  branches: any[];
  selectedBranchId: number | null;
  setSelectedBranchId: (id: number | null) => void;
  currentUser?: any;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  branchName,
  branches,
  selectedBranchId,
  setSelectedBranchId,
  currentUser
}: SidebarProps) {
  
  const role = currentUser?.role || 'OWNER';
 
  const [activePeriod, setActivePeriod] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activePeriod') || '2026-06';
    }
    return '2026-06';
  });
  const [isEditingPeriod, setIsEditingPeriod] = React.useState(false);
 
  const handlePeriodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (!rawVal) return;
    const val = rawVal.slice(0, 7); // Extract YYYY-MM
    setActivePeriod(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('activePeriod', val);
      window.location.reload();
    }
  };
 
  const formatPeriodLabel = (periodStr: string) => {
    try {
      const [year, month] = periodStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
    } catch (e) {
      return periodStr;
    }
  };
 
  const getPeriodDaysLabel = (periodStr: string) => {
    try {
      const [year, month] = periodStr.split('-');
      const y = parseInt(year);
      const m = parseInt(month);
      const lastDay = new Date(y, m, 0).getDate();
      const monthName = new Date(y, m - 1, 1).toLocaleDateString('default', { month: 'short' });
      return `01 ${monthName} - ${lastDay} ${monthName} ${y}`;
    } catch (e) {
      return '';
    }
  };

  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['OWNER', 'MANAGER', 'ACCOUNTANT', 'EMPLOYEE'] },
    { id: 'employees', label: 'Employees', icon: Users, roles: ['OWNER', 'MANAGER'] },
    { id: 'payroll-processing', label: 'Payroll Processing', icon: FileSpreadsheet, roles: ['OWNER', 'MANAGER', 'ACCOUNTANT'] },
    { id: 'bulk-payments', label: 'Bulk Payments', icon: CreditCard, roles: ['OWNER', 'MANAGER', 'ACCOUNTANT'] },
    { id: 'approvals', label: 'Approvals', icon: CheckSquare, roles: ['OWNER', 'MANAGER'] },
    { id: 'branches', label: 'Branches', icon: GitBranch, roles: ['OWNER', 'MANAGER'] },
    { id: 'attendance', label: 'Attendance', icon: CalendarClock, roles: ['OWNER', 'MANAGER', 'ACCOUNTANT'] },
    { id: 'my-attendance', label: 'My Attendance', icon: CalendarClock, roles: ['EMPLOYEE'] },
    { id: 'advances', label: 'Salary Advances', icon: HandCoins, roles: ['OWNER', 'MANAGER', 'ACCOUNTANT'] },
    { id: 'request-advance', label: 'Request Advance', icon: HandCoins, roles: ['EMPLOYEE'] },
    { id: 'payslips', label: 'My Payslips', icon: FileCheck, roles: ['EMPLOYEE'] },
    { id: 'wallet', label: 'Wallet & Finance', icon: Wallet, roles: ['OWNER', 'MANAGER'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['OWNER', 'MANAGER', 'ACCOUNTANT'] },
    { id: 'compliance', label: 'Compliance', icon: FileCheck, roles: ['OWNER', 'MANAGER'] },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: 3, roles: ['OWNER', 'MANAGER', 'ACCOUNTANT', 'EMPLOYEE'] },
    { id: 'audit-logs', label: 'Audit Logs', icon: Activity, roles: ['OWNER', 'MANAGER'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['OWNER', 'MANAGER', 'ACCOUNTANT'] },
    { id: 'profile-settings', label: 'Profile Settings', icon: Settings, roles: ['EMPLOYEE'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-sidebar-bg text-slate-400 flex flex-col h-screen select-none shrink-0 shadow-xl border-r border-white/5">
      {/* Brand Logo */}
      <div className="p-6 flex items-center space-x-3 border-b border-white/10">
        <div className="bg-[var(--brand-green)] p-1.5 rounded-lg flex items-center justify-center text-white shadow-md shadow-emerald-900/20">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </div>
        <div className="text-xl font-bold tracking-tight text-white flex items-center">
          smart<span className="text-[var(--brand-green)] font-extrabold ml-0.5">Pay</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 group btn-hover-scale ${
                isActive 
                  ? 'bg-[var(--brand-green)] text-white shadow-md shadow-emerald-950/20' 
                  : 'hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white text-emerald-600' : 'bg-rose-500 text-white animate-pulse'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Payroll Period Panel */}
      <div className="px-5 py-4 mx-4 mb-4 bg-black/20 border border-white/5 rounded-xl flex flex-col space-y-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Payroll Period</span>
          <span className="text-sm font-bold text-slate-200 block mt-0.5">{formatPeriodLabel(activePeriod)}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">{getPeriodDaysLabel(activePeriod)}</span>
        </div>
        {isEditingPeriod ? (
          <div className="space-y-2">
            <input
              type="date"
              value={`${activePeriod}-01`}
              onChange={handlePeriodChange}
              className="w-full bg-black/35 text-xs text-white border border-white/10 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[var(--brand-green)] font-semibold"
              autoFocus
            />
            <button 
              onClick={() => setIsEditingPeriod(false)}
              className="w-full bg-white/10 hover:bg-white/15 text-slate-300 text-[10px] font-bold py-1 px-2 rounded transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsEditingPeriod(true)}
            className="w-full bg-[var(--brand-green)] hover:bg-[var(--brand-green)]/90 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors btn-hover-scale"
          >
            Change Period
          </button>
        )}
      </div>

      {/* Branch Selector Dropdown Footer */}
      <div className={`p-4 border-t border-white/5 flex items-center justify-between transition-colors ${role !== 'EMPLOYEE' ? 'hover:bg-white/5 cursor-default' : 'cursor-default'} group`}>
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-black/30 border border-white/5 flex items-center justify-center shrink-0">
            <GitBranch className="w-4 h-4 text-[var(--brand-green)]" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block">Active Branch</span>
            {role === 'EMPLOYEE' ? (
              <span className="text-xs font-bold text-slate-200 block mt-0.5 truncate w-36">{branchName}</span>
            ) : (
              <select
                value={selectedBranchId || ''}
                onChange={(e) => setSelectedBranchId(e.target.value ? parseInt(e.target.value) : null)}
                className="text-xs font-bold text-slate-200 bg-transparent border-none p-0 outline-none w-36 select-none cursor-pointer focus:ring-0"
              >
                <option value="" className="bg-sidebar-bg text-slate-200">SuperMart HQ (All)</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-sidebar-bg text-slate-200">
                    {b.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        {role !== 'EMPLOYEE' && (
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
        )}
      </div>
    </aside>
  );
}
