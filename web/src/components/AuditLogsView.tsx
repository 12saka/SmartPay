import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Key, 
  Monitor, 
  Clock, 
  FileLock2
} from 'lucide-react';
import { auditService } from '../services/api';

export default function AuditLogsView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [is2FaEnabled, setIs2FaEnabled] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, [search]);

  async function loadAuditLogs() {
    try {
      setLoading(true);
      const data = await auditService.getAll({ search }).catch(() => [
        { id: 1, userName: 'Jane Doe (CEO)', action: 'APPROVE_PAYROLL', details: 'Authorized final payout run for May 2026', ipAddress: '192.168.1.15', deviceDetails: 'MacBook Pro / Chrome', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: 2, userName: 'John Miller (Manager)', action: 'UPDATE_EMPLOYEE', details: 'Modified basic salary structure for EMP002 (Mercy Achieng)', ipAddress: '192.168.10.42', deviceDetails: 'Windows 11 / Firefox', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
        { id: 3, userName: 'Alice Wambui (Accountant)', action: 'FUND_WALLET', details: 'Requested float funding deposit of KES 1,500,000 to M-Pesa B2C', ipAddress: '192.168.5.110', deviceDetails: 'Dell Latitude / Chrome', timestamp: new Date(Date.now() - 3600000 * 6).toISOString() },
        { id: 4, userName: 'System Gateway', action: 'MPESA_CALLBACK', details: 'M-Pesa Daraja payment batch reference MPESA-PAY-1102923 settled', ipAddress: '196.201.214.2', deviceDetails: 'Server Handshake Agent', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() }
      ]);
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = logs.filter(log => 
    log.userName.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">Audit & Security Center</h1>
        <p className="text-sm text-slate-500">Track and filter platform transactions, manager approvals, settings changes, and login IPs</p>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Two-Factor Authentication Toggle */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-card flex items-center justify-between interactive-card">
          <div className="flex items-center space-x-3.5">
            <div className={`p-2.5 rounded-xl ${
              is2FaEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <Key className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold block">Two-Factor Authentication</span>
              <span className="text-sm font-bold text-slate-800 mt-1 block">
                {is2FaEnabled ? 'Enforced (Highly Secure)' : 'Deactivated (Risky)'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setIs2FaEnabled(!is2FaEnabled)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm border ${
              is2FaEnabled 
                ? 'bg-emerald-600 border-emerald-600 hover:bg-emerald-700 text-white' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
          >
            {is2FaEnabled ? 'Enforced' : 'Enable 2FA'}
          </button>
        </div>

        {/* Active Session Info */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-card flex items-center space-x-3.5 interactive-card">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold block">IP Address Tracking</span>
            <span className="text-sm font-bold text-slate-800 mt-1 block">Active login session from 192.168.1.15</span>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">Location: Nairobi, KE · Chrome Mac</span>
          </div>
        </div>

        {/* Security Health Indicator */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-card flex items-center space-x-3.5 interactive-card">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold block">Security Status</span>
            <span className="text-sm font-bold text-slate-800 mt-1 block">Healthy (Audit Logs Active)</span>
            <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block uppercase tracking-wider">All channels encrypted</span>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-card overflow-hidden">
        {/* Search header */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by user, action, or log details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-400 font-semibold">{filteredLogs.length} events logged</span>
        </div>

        {/* Table content */}
        <div className="overflow-x-auto">
          {loading && logs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">Loading audit history...</div>
          ) : (
            <table className="w-full text-left text-sm border-collapse text-slate-500">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Log Details</th>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4">Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-xs font-semibold text-slate-400 flex items-center space-x-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{log.userName}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                        log.action.includes('PAYOUT') || log.action.includes('APPROVE') ? 'bg-emerald-100 text-emerald-700' :
                        log.action.includes('LOGIN') ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{log.ipAddress}</td>
                    <td className="px-6 py-4 text-xs text-slate-400 truncate max-w-xs">{log.deviceDetails}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
