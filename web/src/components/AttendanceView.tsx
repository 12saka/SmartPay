import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Calendar, 
  UploadCloud, 
  CheckCircle2, 
  Plus, 
  Clock, 
  User, 
  MapPin,
  FileCheck
} from 'lucide-react';
import { useCelebration } from '@/components/providers/CelebrationProvider';

interface AttendanceViewProps {
  currentUser?: any;
}

export default function AttendanceView({ currentUser }: AttendanceViewProps) {
  const searchParams = useSearchParams();
  const action = searchParams.get('action');

  const { celebrate } = useCelebration();
  const [activeTab, setActiveTab] = useState<'logs' | 'shifts'>('logs');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const isEmployee = currentUser?.role === 'EMPLOYEE';
  const isAccountant = currentUser?.role === 'ACCOUNTANT';

  useEffect(() => {
    if (action === 'new' && !isEmployee) {
      setShowUploadModal(true);
    }
  }, [action, isEmployee]);

  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [clockOutTime, setClockOutTime] = useState<string | null>(null);
  const [timeStr, setTimeStr] = useState('');

  // Static mock attendance logs
  const [logs, setLogs] = useState([
    { id: 1, name: 'David Kimani', num: 'EMP001', date: '2026-06-08', shift: 'Morning', in: '08:00 AM', out: '05:00 PM', overtime: 1.0, status: 'Present' },
    { id: 2, name: 'Mercy Achieng', name_id: 'EMP002', date: '2026-06-08', shift: 'Morning', in: '07:45 AM', out: '06:15 PM', overtime: 2.5, status: 'Present' },
    { id: 3, name: 'Peter Ndwiga', num: 'EMP003', date: '2026-06-08', shift: 'Afternoon', in: '01:00 PM', out: '10:00 PM', overtime: 0.0, status: 'Present' },
    { id: 4, name: 'Sarah Mwangi', num: 'EMP004', date: '2026-06-08', shift: 'Morning', in: '08:02 AM', out: '05:00 PM', overtime: 0.0, status: 'Present' },
    { id: 5, name: 'James Omondi', num: 'EMP005', date: '2026-06-08', shift: 'Night', in: '10:00 PM', out: '07:00 AM', overtime: 1.0, status: 'Present' },
    { id: 6, name: 'Joseph Kiprop', num: 'EMP007', date: '2026-06-08', shift: 'Afternoon', in: '—', out: '—', overtime: 0.0, status: 'Absent' },
  ]);

  // Static mock shift templates
  const [shifts, setShifts] = useState([
    { id: 'morning', name: 'Morning Shift', hours: '08:00 AM - 05:00 PM', count: 12, branch: 'Main Supermarket', employees: ['David Kimani', 'Mercy Achieng', 'Sarah Mwangi', 'John Mwaniki', 'Esther Wanjiru'] },
    { id: 'afternoon', name: 'Afternoon Shift', hours: '01:00 PM - 10:00 PM', count: 8, branch: 'Main Supermarket', employees: ['Peter Ndwiga', 'Joseph Kiprop', 'Alice Njeri', 'Michael Ochieng'] },
    { id: 'night', name: 'Night Shift', hours: '10:00 PM - 07:00 AM', count: 4, branch: 'Wholesale Depot', employees: ['James Omondi', 'Grace Kendi', 'Robert Njoroge', 'Lydia Atieno'] }
  ]);

  // Load clock state from localStorage on mount
  useEffect(() => {
    if (currentUser && isEmployee) {
      const emailKey = currentUser.email.toLowerCase();
      const savedDate = localStorage.getItem(`clockDate_${emailKey}`);
      const todayStr = new Date().toISOString().split('T')[0];
      
      let savedIn = false;
      let savedTime: string | null = null;
      let savedOut: string | null = null;
      
      if (savedDate && savedDate !== todayStr) {
        localStorage.removeItem(`clockedIn_${emailKey}`);
        localStorage.removeItem(`clockInTime_${emailKey}`);
        localStorage.removeItem(`clockOutTime_${emailKey}`);
        localStorage.removeItem(`clockDate_${emailKey}`);
      } else {
        savedIn = localStorage.getItem(`clockedIn_${emailKey}`) === 'true';
        savedTime = localStorage.getItem(`clockInTime_${emailKey}`);
        savedOut = localStorage.getItem(`clockOutTime_${emailKey}`);
      }
      
      setClockedIn(savedIn);
      setClockInTime(savedTime);
      setClockOutTime(savedOut);
      
      if (savedTime) {
        setLogs(prev => {
          const hasTodayLog = prev.some(l => l.date === todayStr);
          if (hasTodayLog) {
            return prev.map(l => {
              if (l.date === todayStr) {
                return {
                  ...l,
                  in: savedTime!,
                  out: savedOut || '—',
                  overtime: savedOut ? 0.5 : 0.0,
                  status: 'Present'
                };
              }
              return l;
            });
          } else {
            const todayLog = {
              id: Date.now(),
              name: currentUser?.name || 'David Kimani',
              num: 'EMP001',
              date: todayStr,
              shift: 'Morning Shift',
              in: savedTime,
              out: savedOut || '—',
              overtime: savedOut ? 0.5 : 0.0,
              status: 'Present'
            };
            return [todayLog, ...prev];
          }
        });
      }
    }
  }, [currentUser, isEmployee]);

  useEffect(() => {
    // Tick to update time on UI
    const timer = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    
    // Initial set
    const now = new Date();
    setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    return () => clearInterval(timer);
  }, []);

  const handleClockIn = () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const emailKey = currentUser?.email?.toLowerCase();
    const todayStr = now.toISOString().split('T')[0];
    
    if (emailKey) {
      localStorage.setItem(`clockedIn_${emailKey}`, 'true');
      localStorage.setItem(`clockInTime_${emailKey}`, formattedTime);
      localStorage.setItem(`clockDate_${emailKey}`, todayStr);
      localStorage.removeItem(`clockOutTime_${emailKey}`);
    }

    setClockedIn(true);
    setClockInTime(formattedTime);
    setClockOutTime(null);
    
    // Add today's log to the logs list
    const newLog = {
      id: Date.now(),
      name: currentUser?.name || 'David Kimani',
      num: 'EMP001',
      date: todayStr,
      shift: 'Morning Shift',
      in: formattedTime,
      out: '—',
      overtime: 0.0,
      status: 'Present'
    };
    setLogs(prev => {
      const filtered = prev.filter(l => l.date !== todayStr);
      return [newLog, ...filtered];
    });
    celebrate();
  };

  const handleClockOut = () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const emailKey = currentUser?.email?.toLowerCase();
    const todayStr = now.toISOString().split('T')[0];
    
    if (emailKey) {
      localStorage.setItem(`clockedIn_${emailKey}`, 'false');
      localStorage.setItem(`clockOutTime_${emailKey}`, formattedTime);
    }

    setClockedIn(false);
    setClockOutTime(formattedTime);
    
    // Update the first log (today's check-in) in the logs list
    setLogs(prev => prev.map((log) => {
      if (log.date === todayStr) {
        return {
          ...log,
          out: formattedTime,
          overtime: 0.5
        };
      }
      return log;
    }));
    celebrate();
  };


  const handleUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress(null);
            setShowUploadModal(false);
          }, 600);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const displayLogs = logs.filter(log => {
    if (isEmployee) {
      return log.num === 'EMP001' || log.name.toLowerCase() === currentUser?.name?.toLowerCase();
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            {isEmployee ? 'My Attendance & Clock' : 'Attendance & Shifts'}
          </h1>
          <p className="text-sm text-slate-500">
            {isEmployee 
              ? 'Clock in/out for your cashier shifts and view your historical hours' 
              : 'Track cashier shifts, attendance records, and automatically feed overtime to payroll'}
          </p>
        </div>
        {!isEmployee && (
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm shadow-sm transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Attendance sheet</span>
            </button>
          </div>
        )}
      </div>

      {isAccountant && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-medium space-y-2 animate-fade-in flex items-start space-x-3 shadow-sm">
          <FileCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-emerald-950">Accountant Action Items</h3>
            <p className="text-emerald-800 leading-relaxed mt-1">
              You are responsible for auditing attendance records and shift coverage. Biometric logs and uploaded attendance sheets directly feed regular and overtime hours into the payroll engine. Verify the shift configurations and check the payment impact gauge below before processing the monthly payroll.
            </p>
          </div>
        </div>
      )}

      {/* Clock Simulator for Employees */}
      {isEmployee && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Digital Clock & Punch Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl shadow-xl border border-slate-800 text-white flex flex-col justify-between space-y-6 relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
            
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Shift Clock In / Clock Out</span>
                <span className="text-sm font-bold text-slate-200 block mt-1">Active Shift: Morning Shift (08:00 AM - 05:00 PM)</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                clockedIn ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse' : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {clockedIn ? 'Clocked In' : 'Not Clocked In'}
              </span>
            </div>

            <div className="flex flex-col items-center py-4 space-y-1">
              <span className="text-4xl font-extrabold tracking-tight font-mono text-emerald-400 drop-shadow-md">
                {timeStr || '08:00:00 AM'}
              </span>
              <span className="text-[11px] text-slate-400">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {!clockedIn ? (
                <button
                  onClick={handleClockIn}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-emerald-950/50 btn-hover-scale flex items-center justify-center space-x-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>Clock In</span>
                </button>
              ) : (
                <button
                  onClick={handleClockOut}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-rose-950/50 btn-hover-scale flex items-center justify-center space-x-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>Clock Out</span>
                </button>
              )}
            </div>

            {/* Attendance logs for today details */}
            {(clockInTime || clockOutTime) && (
              <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-4 text-xs text-slate-400">
                <div>
                  <span className="block font-semibold">Clock In:</span>
                  <span className="font-mono text-emerald-400 font-bold">{clockInTime || '—'}</span>
                </div>
                <div>
                  <span className="block font-semibold">Clock Out:</span>
                  <span className="font-mono text-rose-400 font-bold">{clockOutTime || '—'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card flex flex-col justify-between space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800">Weekly Stats Summary</h3>
            
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-500">Regular Hours</span>
                </div>
                <span className="text-sm font-extrabold text-slate-800">40.0 hrs</span>
              </div>
              
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-500">Overtime Hours</span>
                </div>
                <span className="text-sm font-extrabold text-slate-800">2.5 hrs</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-semibold text-slate-500">On-Time Ratio</span>
                </div>
                <span className="text-sm font-extrabold text-slate-800">98.2%</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100/50 text-[10px] text-slate-400 leading-relaxed font-semibold">
              Note: Overtime is automatically logged and sent to Manager / Accountant review for monthly payroll calculation.
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      {!isEmployee && (
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2.5 px-4 font-bold text-sm border-b-2 transition-all ${
              activeTab === 'logs' 
                ? 'border-emerald-500 text-emerald-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Daily Attendance Logs
          </button>
          <button
            onClick={() => setActiveTab('shifts')}
            className={`py-2.5 px-4 font-bold text-sm border-b-2 transition-all ${
              activeTab === 'shifts' 
                ? 'border-emerald-500 text-emerald-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            SME Shift Configurations
          </button>
        </div>
      )}

      {/* Content panel */}
      {activeTab === 'logs' ? (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-500">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Assigned Shift</th>
                    <th className="px-6 py-4">Check-In</th>
                    <th className="px-6 py-4">Check-Out</th>
                    <th className="px-6 py-4">Overtime Hours</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {displayLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 text-slate-700">
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-bold text-slate-900 block">{log.name}</span>
                          <span className="text-xs text-slate-400 block mt-0.5">{log.num || 'EMP002'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{log.date}</td>
                      <td className="px-6 py-4">
                        <span className="text-slate-800">{log.shift} Shift</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold">{log.in}</td>
                      <td className="px-6 py-4 text-xs font-semibold">{log.out}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {log.overtime > 0 ? `${log.overtime} hrs` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.status === 'Present' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Impact Gauge Panel */}
          {isAccountant && (
            <div className="bg-white border border-slate-200/80 rounded-xl shadow-card overflow-hidden animate-slide-up">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Payroll Payment Impact Gauge</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Estimated overtime payouts and absent day deductions based on current period attendance logs</p>
                </div>
                <div className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-100 shrink-0 self-start sm:self-auto">
                  Total Projected Overtime: KES 96,750
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3">Employee</th>
                      <th className="px-6 py-3 text-center">Days Present</th>
                      <th className="px-6 py-3 text-center">Absent Days</th>
                      <th className="px-6 py-3 text-center">Deductions (KES)</th>
                      <th className="px-6 py-3 text-center">Overtime Hours</th>
                      <th className="px-6 py-3 text-center">Overtime Pay (KES)</th>
                      <th className="px-6 py-3 text-right">Net Payroll Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {[
                      { name: 'David Kimani', role: 'Cashier (Morning Shift)', presentDays: 21, absentDays: 1, deductions: 2000, overtimeHours: 8.5, overtimePay: 12750, netImpact: 10750 },
                      { name: 'Mercy Achieng', role: 'Head Cashier (Morning Shift)', presentDays: 22, absentDays: 0, deductions: 0, overtimeHours: 12.0, overtimePay: 24000, netImpact: 24000 },
                      { name: 'Peter Ndwiga', role: 'Store Keeper (Afternoon Shift)', presentDays: 20, absentDays: 2, deductions: 4000, overtimeHours: 4.0, overtimePay: 6000, netImpact: 2000 },
                      { name: 'Sarah Mwangi', role: 'Sales Rep (Morning Shift)', presentDays: 22, absentDays: 0, deductions: 0, overtimeHours: 0.0, overtimePay: 0, netImpact: 0 },
                      { name: 'James Omondi', role: 'Night Guard (Night Shift)', presentDays: 22, absentDays: 0, deductions: 0, overtimeHours: 27.0, overtimePay: 54000, netImpact: 54000 },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3.5">
                          <div className="font-bold text-slate-800 block">{row.name}</div>
                          <div className="text-[10px] text-slate-400 block mt-0.5">{row.role}</div>
                        </td>
                        <td className="px-6 py-3.5 text-center font-mono">{row.presentDays} / 22</td>
                        <td className="px-6 py-3.5 text-center font-mono text-rose-600 font-bold">{row.absentDays}</td>
                        <td className="px-6 py-3.5 text-center font-mono text-rose-600 font-bold">-{row.deductions.toLocaleString()} KES</td>
                        <td className="px-6 py-3.5 text-center font-mono text-emerald-600 font-bold">{row.overtimeHours} hrs</td>
                        <td className="px-6 py-3.5 text-center font-mono text-emerald-600 font-bold">+{row.overtimePay.toLocaleString()} KES</td>
                        <td className={`px-6 py-3.5 text-right font-mono font-extrabold ${row.netImpact >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {row.netImpact >= 0 ? '+' : ''}{row.netImpact.toLocaleString()} KES
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shifts.map((s) => (
            <div key={s.id} className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-card flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">{s.name}</span>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                  {s.count} Employees
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hours: {s.hours}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Branch: {s.branch}</span>
                </div>
              </div>
              {s.employees && (
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Assigned Staff</span>
                  <div className="flex flex-wrap gap-1">
                    {s.employees.map((empName, i) => (
                      <span key={i} className="text-[10px] bg-slate-50 border border-slate-100 font-semibold px-2 py-0.5 rounded-full text-slate-600">
                        {empName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <button className="w-full text-center border border-slate-200 hover:border-slate-300 text-slate-600 font-bold py-2 rounded-lg text-xs transition-colors">
                Configure Shift Roster
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-slate-200 animate-fade-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Upload Attendance Logs</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircleIcon />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center justify-center space-y-4">
              {uploadProgress !== null ? (
                <div className="w-full space-y-3 flex flex-col items-center py-4">
                  <LoaderIcon />
                  <span className="text-sm font-bold text-slate-700">Uploading logs... {uploadProgress}%</span>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-full border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center space-y-3 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/10 transition-all">
                    <UploadCloud className="w-10 h-10 text-slate-300" />
                    <span className="text-xs font-bold text-slate-600">Drag & drop attendance CSV here</span>
                    <span className="text-[10px] text-slate-400">Supports BIOMETRIC logs, fingerprint scanners, or Excel formats</span>
                  </div>
                  <button 
                    onClick={handleUpload}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-lg text-xs transition-colors"
                  >
                    Simulate Upload
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function XCircleIcon() {
  return (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
    </svg>
  );
}

function LoaderIcon() {
  return (
    <svg className="animate-spin w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
