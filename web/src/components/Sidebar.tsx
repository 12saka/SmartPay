import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calculator, 
  Wallet, 
  Receipt, 
  CalendarClock, 
  TrendingUp, 
  Bell, 
  Settings, 
  GitBranch, 
  ShieldAlert, 
  ChevronDown,
  HandCoins
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  branchName: string;
  branches: any[];
  selectedBranchId: number | null;
  setSelectedBranchId: (id: number | null) => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  branchName,
  branches,
  selectedBranchId,
  setSelectedBranchId
}: SidebarProps) {
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'payroll', label: 'Payroll', icon: Calculator },
    { id: 'payments', label: 'Payments', icon: Wallet },
    { id: 'payslips', label: 'Payslips', icon: Receipt },
    { id: 'attendance', label: 'Attendance', icon: CalendarClock },
    { id: 'advances', label: 'Advances', icon: HandCoins },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: 5 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'branches', label: 'Branches', icon: GitBranch },
    { id: 'roles', label: 'Roles & Permissions', icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 bg-sidebar-bg text-slate-400 flex flex-col h-screen select-none shrink-0 shadow-xl border-r border-slate-800/40">
      {/* Brand Logo */}
      <div className="p-6 flex items-center space-x-3 border-b border-slate-800/60">
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
                  ? 'bg-[var(--brand-green)] text-white shadow-md shadow-emerald-950/40' 
                  : 'hover:bg-slate-800/60 hover:text-slate-100'
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
      <div className="px-5 py-4 mx-4 mb-4 bg-slate-950/50 border border-slate-800/80 rounded-xl flex flex-col space-y-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Payroll Period</span>
          <span className="text-sm font-bold text-slate-200 block mt-0.5">May 2024</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">01 May - 31 May 2024</span>
        </div>
        <button className="w-full bg-[var(--brand-green)] hover:bg-[#0c8a50] text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors btn-hover-scale">
          Change Period
        </button>
      </div>

      {/* Branch Selector Dropdown Footer */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between hover:bg-slate-800/30 cursor-pointer group transition-colors">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0">
            <GitBranch className="w-4 h-4 text-[var(--brand-green)]" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block">Active Branch</span>
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
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
      </div>
    </aside>
  );
}
