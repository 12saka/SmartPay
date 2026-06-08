import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { authService } from '../services/api';

interface TopbarProps {
  onLogout: () => void;
  user: any;
}

export default function Topbar({ onLogout, user }: TopbarProps) {
  const userName = user?.name || 'John Manager';
  const userRole = user?.role || 'Manager';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 select-none">
      {/* Search Bar section */}
      <div className="flex items-center space-x-4 flex-1 max-w-lg">
        <button className="text-slate-500 hover:text-slate-800 lg:hidden">
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search employees, ID, departments..."
            className="w-full text-sm pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Notifications & Profile info */}
      <div className="flex items-center space-x-6">
        {/* Notification bell */}
        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>

        {/* User Info Profile Dropdown */}
        <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
          <div className="text-right hidden sm:block">
            <span className="text-sm font-bold text-slate-800 block leading-tight">{userName}</span>
            <span className="text-xs text-slate-500 block leading-tight capitalize">{userRole.toLowerCase()}</span>
          </div>
          
          <button 
            onClick={onLogout} 
            title="Click to logout" 
            className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all overflow-hidden"
          >
            {userName.substring(0, 2).toUpperCase()}
          </button>
        </div>
      </div>
    </header>
  );
}
