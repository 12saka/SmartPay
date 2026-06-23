import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  AlertCircle, 
  CalendarClock, 
  UserPlus, 
  Wallet,
  CheckCircle2
} from 'lucide-react';
import { notificationService } from '../services/api';

export default function NotificationsView() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  async function loadNotifications() {
    try {
      setLoading(true);
      const data = await notificationService.getAll({ 
        category: filter === 'ALL' ? undefined : filter 
      }).catch(() => [
        { id: 1, title: 'Filing Deadline Approaching', message: 'NHIF statutory return filing for May is due in 3 days.', category: 'COMPLIANCE', status: 'UNREAD', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 2, title: 'New Employee Registered', message: 'Employee EMP018 (Emily Kendi) was successfully onboarded.', category: 'EMPLOYEE', status: 'UNREAD', createdAt: new Date(Date.now() - 3600000 * 3).toISOString() },
        { id: 3, title: 'Salary Advance Request Approved', message: 'Approved KES 15,000 advance request for David Kimani.', category: 'FINANCE', status: 'READ', createdAt: new Date(Date.now() - 3600000 * 12).toISOString() },
        { id: 4, title: 'M-Pesa Gateway Synchronized', message: 'B2C payout channel successfully tested and active.', category: 'SYSTEM', status: 'READ', createdAt: new Date(Date.now() - 3600000 * 24).toISOString() }
      ]);
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleMarkRead = async (id: number) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'READ' } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })));
    } catch (err) {
      console.error(err);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'COMPLIANCE':
        return <CalendarClock className="w-4.5 h-4.5 text-rose-500" />;
      case 'EMPLOYEE':
        return <UserPlus className="w-4.5 h-4.5 text-purple-500" />;
      case 'FINANCE':
        return <Wallet className="w-4.5 h-4.5 text-emerald-500" />;
      case 'PAYROLL':
        return <CheckCircle2 className="w-4.5 h-4.5 text-blue-500" />;
      default:
        return <Bell className="w-4.5 h-4.5 text-slate-500" />;
    }
  };

  const categories = ['ALL', 'PAYROLL', 'EMPLOYEE', 'FINANCE', 'COMPLIANCE', 'SYSTEM'];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Notifications Center</h1>
          <p className="text-sm text-slate-500 font-medium">Verify system events, statutory warnings, and manager approvals</p>
        </div>
        {notifications.some(n => n.status === 'UNREAD') && (
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center space-x-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-lg text-sm shadow-sm transition-all btn-hover-scale"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200/60 overflow-x-auto space-x-6 select-none no-scrollbar">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`pb-3 text-xs font-bold uppercase tracking-wider relative transition-colors ${
              filter === c 
                ? 'text-[var(--brand-green)] border-b-2 border-[var(--brand-green)]' 
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Roster list */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-card overflow-hidden">
        {loading && notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Loading alerts log...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
            <Bell className="w-8 h-8 text-slate-300" />
            <span className="font-bold text-slate-500">Inbox is clean</span>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">There are no warnings or approval messages in this category.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => {
              const isUnread = n.status === 'UNREAD';
              return (
                <div 
                  key={n.id} 
                  className={`p-4 flex items-start justify-between transition-colors ${
                    isUnread ? 'bg-slate-50/50' : 'bg-white'
                  }`}
                >
                  <div className="flex space-x-4">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      isUnread ? 'bg-slate-100' : 'bg-slate-50'
                    }`}>
                      {getCategoryIcon(n.category)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-bold ${
                          isUnread ? 'text-slate-900' : 'text-slate-700'
                        }`}>
                          {n.title}
                        </span>
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block animate-pulse"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">{n.message}</p>
                      <span className="text-[10px] text-slate-400 block mt-2 font-semibold">
                        {new Date(n.createdAt).toLocaleDateString()} · {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {isUnread && (
                    <button 
                      onClick={() => handleMarkRead(n.id)}
                      className="text-xs text-[var(--brand-green)] hover:underline font-bold"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
