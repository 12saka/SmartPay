import React, { useState } from 'react';
import { Menu, Bell, Search, User, LogOut, Settings, Wallet, Key } from 'lucide-react';
import { authService } from '../services/api';

interface TopbarProps {
  onLogout: () => void;
  user: any;
  setCurrentTab: (tab: string) => void;
}

export default function Topbar({ onLogout, user, setCurrentTab }: TopbarProps) {
  const userName = user?.name || 'Jane Doe';
  const userRole = user?.role || 'OWNER';

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);

  const mockQuickNotifications = [
    { id: 1, title: 'Compliance deadline today', time: '5m ago', type: 'COMPLIANCE' },
    { id: 2, title: 'New Employee EMP018 registered', time: '1h ago', type: 'EMPLOYEE' },
    { id: 3, title: 'Advance Approved KES 15,000', time: '6h ago', type: 'FINANCE' }
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 select-none relative z-30">
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

      {/* Greeting next to search */}
      <div className="hidden md:flex items-center text-sm font-semibold text-slate-700 ml-4 shrink-0">
        Welcome back, {userName.split(' ')[0]} 👋
      </div>

      {/* Notifications & Profile info */}
      <div className="flex items-center space-x-6">
        {/* Notification bell and dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotificationsMenu(!showNotificationsMenu);
              setShowProfileMenu(false);
            }}
            className="relative p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
          </button>

          {showNotificationsMenu && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-transparent cursor-default" 
                onClick={() => setShowNotificationsMenu(false)}
              />
              <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between font-bold text-slate-800 text-xs">
                  <span>Recent Notifications</span>
                  <button 
                    onClick={() => { setCurrentTab('notifications'); setShowNotificationsMenu(false); }} 
                    className="text-emerald-600 hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {mockQuickNotifications.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-slate-50/50 cursor-pointer">
                      <span className="text-xs font-bold text-slate-800 block">{n.title}</span>
                      <span className="text-[10px] text-slate-400 block mt-1">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Info Profile Dropdown */}
        <div className="flex items-center space-x-3 border-l border-slate-200 pl-6 relative">
          <div 
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotificationsMenu(false);
            }}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="text-right hidden sm:block">
              <span className="text-sm font-bold text-slate-800 block leading-tight group-hover:text-emerald-600 transition-colors">{userName}</span>
              <span className="text-xs text-slate-500 block leading-tight capitalize">{userRole.toLowerCase()}</span>
            </div>
            
            <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center font-bold text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-all overflow-hidden">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={userName} className="w-full h-full object-cover" />
              ) : (
                userName.substring(0, 2).toUpperCase()
              )}
            </div>
          </div>

          {showProfileMenu && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-transparent cursor-default" 
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 top-11 w-60 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800 block leading-tight">{userName}</span>
                  <span className="text-[10px] text-slate-400 block mt-1 uppercase tracking-wider">{userRole}</span>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setCurrentTab('profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab('settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Company Settings</span>
                  </button>
                </div>
                <div className="border-t border-slate-100 px-4 py-2.5 space-y-1 bg-slate-50/50 text-[10px] font-semibold text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <Wallet className="w-3.5 h-3.5 text-slate-400" />
                    <span>M-Pesa: 0711***344</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    <span>2FA Enforced</span>
                  </div>
                </div>
                <div className="border-t border-slate-100 py-1">
                  <button
                    onClick={() => {
                      onLogout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
