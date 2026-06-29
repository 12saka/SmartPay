import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  AlertCircle, 
  CalendarClock, 
  UserPlus, 
  Wallet,
  CheckCircle2,
  Send,
  Plus,
  XCircle
} from 'lucide-react';
import { notificationService, employeeService } from '../services/api';
import { useAuth } from './providers/AuthProvider';

export default function NotificationsView() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const role = user?.role || 'EMPLOYEE';
  const canSend = ['OWNER', 'MANAGER', 'ACCOUNTANT', 'HR'].includes(role);

  // Compose states
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [composeForm, setComposeForm] = useState({
    userId: '',
    title: '',
    message: '',
    category: 'SYSTEM'
  });
  const [submitting, setSubmitting] = useState(false);
  const [composeError, setComposeError] = useState('');
  const [composeSuccess, setComposeSuccess] = useState('');

  const handleOpenCompose = async () => {
    setComposeForm({
      userId: '',
      title: '',
      message: '',
      category: 'SYSTEM'
    });
    setComposeError('');
    setComposeSuccess('');
    setIsComposeOpen(true);
    
    try {
      const emps = await employeeService.getAll().catch(() => []);
      setEmployees(emps);
    } catch (err) {
      console.error('Failed to load employees for notifications', err);
    }
  };

  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setComposeError('');
    setComposeSuccess('');
    
    if (!composeForm.title || !composeForm.message) {
      setComposeError('Please fill in both title and message.');
      return;
    }
    
    try {
      setSubmitting(true);
      await notificationService.create({
        userId: composeForm.userId ? parseInt(composeForm.userId) : null,
        title: composeForm.title,
        message: composeForm.message,
        category: composeForm.category
      });
      
      setComposeSuccess('Notification sent successfully!');
      setTimeout(() => {
        setIsComposeOpen(false);
        loadNotifications();
      }, 1000);
    } catch (err: any) {
      setComposeError(err.message || 'Failed to send notification');
    } finally {
      setSubmitting(false);
    }
  };

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
        <div className="flex items-center space-x-3">
          {canSend && (
            <button 
              onClick={handleOpenCompose}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-lg text-sm shadow-sm transition-all btn-hover-scale"
            >
              <Send className="w-4 h-4" />
              <span>Send Announcement</span>
            </button>
          )}
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
                  onClick={() => {
                    setSelectedNotification(n);
                    if (isUnread) {
                      handleMarkRead(n.id);
                    }
                  }}
                  className={`p-4 flex items-start justify-between transition-colors cursor-pointer hover:bg-slate-50/70 ${
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(n.id);
                      }}
                      className="text-xs text-[var(--brand-green)] hover:underline font-bold shrink-0 ml-4"
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

      {/* Compose Notification Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-slate-200 animate-fade-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Send Notification / Announcement</h3>
              <button onClick={() => setIsComposeOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleComposeSubmit} className="p-6 space-y-4">
              {composeError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-xs font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{composeError}</span>
                </div>
              )}
              {composeSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg text-xs font-semibold flex items-center space-x-2">
                  <CheckCheck className="w-4 h-4 shrink-0" />
                  <span>{composeSuccess}</span>
                </div>
              )}

              {/* Target recipient */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Target Recipient</label>
                <select
                  value={composeForm.userId}
                  onChange={(e) => setComposeForm(prev => ({ ...prev, userId: e.target.value }))}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium text-slate-700"
                >
                  <option value="">All Users (Global Announcement)</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.employeeNumber} - {emp.department})</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Category</label>
                <select
                  value={composeForm.category}
                  onChange={(e) => setComposeForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium text-slate-700"
                >
                  <option value="SYSTEM">SYSTEM</option>
                  <option value="PAYROLL">PAYROLL</option>
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="FINANCE">FINANCE</option>
                  <option value="COMPLIANCE">COMPLIANCE</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g., System Maintenance Scheduled"
                  value={composeForm.title}
                  onChange={(e) => setComposeForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium text-slate-700"
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Message Content</label>
                <textarea
                  rows={4}
                  placeholder="Type your announcement or message details here..."
                  value={composeForm.message}
                  onChange={(e) => setComposeForm(prev => ({ ...prev, message: e.target.value }))}
                  required
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none font-medium text-slate-700"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold py-2.5 px-4 rounded-xl text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* View Notification Details Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-slate-200 animate-fade-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-slate-100 rounded-lg">
                  {getCategoryIcon(selectedNotification.category)}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {selectedNotification.category}
                </span>
              </div>
              <button 
                onClick={() => setSelectedNotification(null)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-left">
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {selectedNotification.title}
              </h3>
              
              <p className="text-xs text-slate-600 leading-relaxed font-semibold whitespace-pre-wrap">
                {selectedNotification.message}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold">
                  Sent: {new Date(selectedNotification.createdAt).toLocaleDateString()} at {new Date(selectedNotification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                
                <button
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-4 rounded-lg text-xs transition-all shadow-sm cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
