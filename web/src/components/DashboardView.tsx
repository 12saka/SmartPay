import React, { useEffect, useState } from 'react';
import { 
  Users, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  GitBranch, 
  UserPlus, 
  FileSpreadsheet, 
  CalendarClock, 
  FileDown,
  Plus,
  FileCheck,
  Wallet
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { reportService, employeeService, advanceService, payrollService } from '../services/api';
import { Skeleton } from './ui/Skeleton';
import { useAuth } from './providers/AuthProvider';
import { useCelebration } from './providers/CelebrationProvider';
import { HandCoins, ArrowUpRight, FileText } from 'lucide-react';

// Static fallback data for the line chart (matching the mockup exactly)
const mockTrendsData = [
  { month: 'Dec', payrollAmount: 2200000, employeeCount: 115 },
  { month: 'Jan', payrollAmount: 2400000, employeeCount: 128 },
  { month: 'Feb', payrollAmount: 2350000, employeeCount: 130 },
  { month: 'Mar', payrollAmount: 2600000, employeeCount: 138 },
  { month: 'Apr', payrollAmount: 2750000, employeeCount: 140 },
  { month: 'May', payrollAmount: 3100000, employeeCount: 156 },
];

// Static fallback data for the donut chart (matching the mockup exactly)
const mockDeptData = [
  { name: 'Sales', value: 800000, percentage: '32.7%', color: '#2563eb' },
  { name: 'Cashiers', value: 600000, percentage: '24.5%', color: '#06b6d4' },
  { name: 'Warehousing', value: 450000, percentage: '18.4%', color: '#f59e0b' },
  { name: 'Administration', value: 350000, percentage: '14.3%', color: '#ec4899' },
  { name: 'Others', value: 250000, percentage: '10.1%', color: '#8b5cf6' },
];

interface DashboardViewProps {
  setCurrentTab: (tab: string) => void;
  selectedBranchId: number | null;
}

export default function DashboardView({ setCurrentTab, selectedBranchId }: DashboardViewProps) {
  const { user } = useAuth();
  const { celebrate } = useCelebration();
  const role = user?.role || 'OWNER';
  const name = user?.name || 'User';

  const [stats, setStats] = useState<any>({
    totalEmployees: 156,
    totalPayrollAmount: 2450000,
    paidEmployees: 120,
    pendingEmployees: 36,
    pendingAmount: 540000,
    totalBranches: 4,
    recentTransactions: []
  });
  
  const [trends, setTrends] = useState<any[]>(mockTrendsData);
  const [deptData, setDeptData] = useState<any[]>(mockDeptData);
  const [loading, setLoading] = useState(true);

  // Employee-specific state
  const [employeeDetails, setEmployeeDetails] = useState<any>(null);
  const [personalAdvances, setPersonalAdvances] = useState<any[]>([]);
  const [personalPayslips, setPersonalPayslips] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState('');
  const [clockState, setClockState] = useState({
    clockedIn: false,
    checkInTime: null as string | null,
    checkOutTime: null as string | null,
  });

  const getFallbackEmployeeInfo = (email: string) => {
    const normalized = email.toLowerCase();
    if (normalized.includes('david.kimani')) {
      return {
        id: 1,
        fullName: 'David Kimani',
        employeeNumber: 'EMP001',
        department: 'Sales',
        position: 'Sales Assistant',
        salary: 42000,
        attendanceRate: '97.2%',
        shift: 'Morning Shift (08:00 AM - 05:00 PM)'
      };
    } else if (normalized.includes('mercy.achieng')) {
      return {
        id: 2,
        fullName: 'Mercy Achieng',
        employeeNumber: 'EMP002',
        department: 'Cashiers',
        position: 'Lead Cashier',
        salary: 48000,
        attendanceRate: '98.5%',
        shift: 'Morning Shift (08:00 AM - 05:00 PM)'
      };
    } else if (normalized.includes('sarah.mwangi')) {
      return {
        id: 4,
        fullName: 'Sarah Mwangi',
        employeeNumber: 'EMP004',
        department: 'Warehousing',
        position: 'Inventory Officer',
        salary: 45000,
        attendanceRate: '96.8%',
        shift: 'Morning Shift (08:00 AM - 05:00 PM)'
      };
    }
    return {
      id: 9,
      fullName: name,
      employeeNumber: 'EMP009',
      department: 'Operations',
      position: 'Associate',
      salary: 40000,
      attendanceRate: '95.0%',
      shift: 'Morning Shift (08:00 AM - 05:00 PM)'
    };
  };

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    return () => clearInterval(timer);
  }, []);

  // Load clock state from localStorage on mount
  useEffect(() => {
    if (user && role === 'EMPLOYEE') {
      const emailKey = user.email.toLowerCase();
      const savedDate = localStorage.getItem(`clockDate_${emailKey}`);
      const todayStr = new Date().toISOString().split('T')[0];
      
      if (savedDate && savedDate !== todayStr) {
        localStorage.removeItem(`clockedIn_${emailKey}`);
        localStorage.removeItem(`clockInTime_${emailKey}`);
        localStorage.removeItem(`clockOutTime_${emailKey}`);
        localStorage.removeItem(`clockDate_${emailKey}`);
        setClockState({
          clockedIn: false,
          checkInTime: null,
          checkOutTime: null,
        });
      } else {
        const savedIn = localStorage.getItem(`clockedIn_${emailKey}`) === 'true';
        const savedTime = localStorage.getItem(`clockInTime_${emailKey}`);
        const savedOut = localStorage.getItem(`clockOutTime_${emailKey}`);
        setClockState({
          clockedIn: savedIn,
          checkInTime: savedTime,
          checkOutTime: savedOut,
        });
      }
    }
  }, [user, role]);

  const handleClockIn = () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const emailKey = user?.email.toLowerCase();
    const todayStr = now.toISOString().split('T')[0];
    
    if (emailKey) {
      localStorage.setItem(`clockedIn_${emailKey}`, 'true');
      localStorage.setItem(`clockInTime_${emailKey}`, formattedTime);
      localStorage.setItem(`clockDate_${emailKey}`, todayStr);
      localStorage.removeItem(`clockOutTime_${emailKey}`);
    }
    
    setClockState({
      clockedIn: true,
      checkInTime: formattedTime,
      checkOutTime: null,
    });
    
    celebrate();
  };

  const handleClockOut = () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const emailKey = user?.email.toLowerCase();
    
    if (emailKey) {
      localStorage.setItem(`clockedIn_${emailKey}`, 'false');
      localStorage.setItem(`clockOutTime_${emailKey}`, formattedTime);
    }
    
    setClockState(prev => ({
      ...prev,
      clockedIn: false,
      checkOutTime: formattedTime,
    }));
    
    celebrate();
  };

  // Fetch data
  useEffect(() => {
    async function loadStats() {
      if (role === 'EMPLOYEE') return;
      try {
        setLoading(true);
        const [statsData, trendsData, deptsData] = await Promise.all([
          reportService.getStats({ branchId: selectedBranchId || undefined }),
          reportService.getTrends({ branchId: selectedBranchId || undefined }),
          reportService.getDepartments({ branchId: selectedBranchId || undefined })
        ]);
        
        if (statsData.totalEmployees > 0) {
          setStats(statsData);
        }
        if (trendsData && trendsData.length > 0) {
          const formatted = trendsData.map(t => ({
            ...t,
            month: t.month.split('-')[1] === '05' ? 'May' : t.month
          }));
          setTrends(formatted);
        }
        if (deptsData && deptsData.departments && deptsData.departments.length > 0) {
          const colors = ['#2563eb', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6'];
          const formatted = deptsData.departments.map((d: any, i: number) => ({
            name: d.department,
            value: d.amount,
            percentage: `${d.percentage}%`,
            color: colors[i % colors.length]
          }));
          setDeptData(formatted);
        }
      } catch (err) {
        console.warn('Could not load real stats, using seed/mock mockups.', err);
      } finally {
        setLoading(false);
      }
    }

    async function loadEmployeeData() {
      if (role !== 'EMPLOYEE' || !user) return;
      try {
        setLoading(true);
        const allEmployees = await employeeService.getAll().catch(() => []);
        const currentEmployee = allEmployees.find((e: any) => e.email.toLowerCase() === user.email.toLowerCase());
        
        let details = currentEmployee;
        if (!details) {
          details = getFallbackEmployeeInfo(user.email);
        }
        setEmployeeDetails(details);

        if (details && details.id) {
          const advances = await advanceService.getAll({ employeeId: details.id }).catch(() => []);
          setPersonalAdvances(advances);
        }

        const payslips = await payrollService.getAll({ status: 'PAID' }).catch(() => []);
        const filteredPayslips = payslips.filter((p: any) => p.employee?.email?.toLowerCase() === user.email.toLowerCase());
        setPersonalPayslips(filteredPayslips);

      } catch (err) {
        console.error('Error loading employee dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    if (role === 'EMPLOYEE') {
      loadEmployeeData();
    } else {
      loadStats();
    }
  }, [selectedBranchId, user, role]);

  const quickActions = [
    { id: 'payroll', label: 'Run Payroll', icon: FileSpreadsheet, action: () => setCurrentTab('payroll-processing'), roles: ['OWNER', 'MANAGER', 'HR', 'ACCOUNTANT'] },
    { id: 'payments', label: 'Bulk Payment', icon: Wallet, action: () => setCurrentTab('bulk-payments'), roles: ['OWNER', 'MANAGER', 'ACCOUNTANT'] },
    { id: 'advances', label: 'Salary Advances', icon: HandCoins, action: () => setCurrentTab('advances?action=new'), roles: ['OWNER', 'MANAGER', 'ACCOUNTANT'] },
    { id: 'attendance', label: 'Upload Attendance', icon: CalendarClock, action: () => setCurrentTab('attendance?action=new'), roles: ['OWNER', 'MANAGER', 'ACCOUNTANT'] },
    { id: 'payslips', label: 'Generate Payslips', icon: FileCheck, action: () => setCurrentTab('payslips'), roles: ['OWNER', 'MANAGER', 'ACCOUNTANT'] },
    { id: 'employees', label: 'Add Employee', icon: UserPlus, action: () => setCurrentTab('employees?action=new'), roles: ['OWNER', 'MANAGER', 'HR'] },
  ].filter(action => action.roles.includes(role));

  const activeAdvanceSum = personalAdvances
    .filter((a: any) => a.status === 'PENDING' || a.status === 'APPROVED')
    .reduce((sum: number, a: any) => sum + a.amount, 0);

  const mockPersonalLogs = [
    { date: new Date().toISOString().split('T')[0], shift: 'Morning Shift', in: clockState.checkInTime || '—', out: clockState.checkOutTime || '—', status: clockState.clockedIn ? 'Present (Active)' : clockState.checkInTime ? 'Present' : 'Not Clocked In' },
    { date: '2026-06-24', shift: 'Morning Shift', in: '08:02 AM', out: '05:00 PM', status: 'Present' },
    { date: '2026-06-23', shift: 'Morning Shift', in: '07:58 AM', out: '05:05 PM', status: 'Present' },
    { date: '2026-06-22', shift: 'Morning Shift', in: '08:15 AM', out: '05:00 PM', status: 'Late' },
    { date: '2026-06-19', shift: 'Morning Shift', in: '08:00 AM', out: '05:10 PM', status: 'Present' },
  ];

  if (role === 'EMPLOYEE') {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Employee Header Panel */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">My Dashboard</h1>
            <p className="text-sm text-slate-500 font-medium">Overview of your employment and activities</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
              clockState.clockedIn ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-slate-100 text-slate-600'
            }`}>
              Status: {clockState.clockedIn ? 'Clocked In' : 'Clocked Out'}
            </span>
          </div>
        </div>

        {/* Employee Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Basic Salary */}
          <div className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-card flex items-center space-x-4 glass-card-hover animate-slide-up stagger-1">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-xs text-slate-400 block font-bold">My Monthly Salary</span>
              {loading ? <Skeleton className="h-6 w-24 mt-1" /> : (
                <span className="text-2xl font-bold text-slate-800 leading-none mt-1 block">
                  KES {employeeDetails?.salary ? employeeDetails.salary.toLocaleString() : '45,000'}
                </span>
              )}
              <span className="text-[10px] text-slate-400 block mt-1 font-semibold">
                Base salary amount
              </span>
            </div>
          </div>

          {/* Card 2: Attendance Rate */}
          <div className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-card flex items-center space-x-4 glass-card-hover animate-slide-up stagger-1">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-xs text-slate-400 block font-bold">My Attendance Rate</span>
              {loading ? <Skeleton className="h-6 w-16 mt-1" /> : (
                <span className="text-2xl font-bold text-slate-800 leading-none mt-1 block">
                  {employeeDetails?.attendanceRate || '96.8%'}
                </span>
              )}
              <span className="text-[10px] text-slate-400 block mt-1 font-semibold">
                Current month average
              </span>
            </div>
          </div>

          {/* Card 3: Active Salary Advance */}
          <div className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-card flex items-center space-x-4 glass-card-hover animate-slide-up stagger-2">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
              <HandCoins className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-xs text-slate-400 block font-bold">Active Salary Advance</span>
              {loading ? <Skeleton className="h-6 w-20 mt-1" /> : (
                <span className="text-2xl font-bold text-slate-800 leading-none mt-1 block">
                  KES {activeAdvanceSum.toLocaleString()}
                </span>
              )}
              <span className="text-[10px] text-slate-400 block mt-1 font-semibold">
                Pending/approved sum
              </span>
            </div>
          </div>

          {/* Card 4: Payslips */}
          <div className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-card flex items-center space-x-4 glass-card-hover animate-slide-up stagger-2">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-xs text-slate-400 block font-bold">Payslips Available</span>
              {loading ? <Skeleton className="h-6 w-16 mt-1" /> : (
                <span className="text-2xl font-bold text-slate-800 leading-none mt-1 block">
                  {personalPayslips.length}
                </span>
              )}
              <span className="text-[10px] text-slate-400 block mt-1 font-semibold">
                Downloadable payslips
              </span>
            </div>
          </div>
        </div>

        {/* Employee Middle Grid: Clock-in Card & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clock In / Out Punch widget */}
          <div className="bg-white p-6 border border-slate-200/80 rounded-xl shadow-card flex flex-col items-center justify-center text-center glass-card-hover animate-slide-up stagger-2 min-h-[300px]">
            <h2 className="text-base font-bold text-slate-800 mb-2">Punch Clock</h2>
            <div className="text-3xl font-extrabold text-[var(--brand-green)] tracking-wider tabular-nums font-mono my-4 bg-slate-50 border border-slate-100 rounded-xl px-6 py-3 shadow-inner">
              {currentTime || '12:00:00 PM'}
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-6">
              {clockState.clockedIn 
                ? `Clocked in since ${clockState.checkInTime}` 
                : clockState.checkOutTime 
                  ? `Clocked out at ${clockState.checkOutTime}` 
                  : 'You are currently Clocked Out'}
            </p>
            {clockState.clockedIn ? (
              <button 
                onClick={handleClockOut}
                className="w-full max-w-[240px] py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg btn-hover-scale"
              >
                Clock Out
              </button>
            ) : (
              <button 
                onClick={handleClockIn}
                className="w-full max-w-[240px] py-3 bg-[var(--brand-green)] hover:bg-[#0c8a50] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg btn-hover-scale"
              >
                Clock In
              </button>
            )}
          </div>

          {/* Quick Actions / Shortcuts */}
          <div className="bg-white p-6 border border-slate-200/80 rounded-xl shadow-card flex flex-col justify-center glass-card-hover animate-slide-up stagger-3">
            <h2 className="text-base font-bold text-slate-800 mb-4">Quick Links</h2>
            <div className="space-y-4">
              <button 
                onClick={() => setCurrentTab('request-advance?action=new')}
                className="w-full flex items-center justify-between p-4 border border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/5 rounded-xl transition-all group btn-hover-scale text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                    <HandCoins className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">Apply for Salary Advance</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">Request cash advances instantly</span>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
              </button>

              <button 
                onClick={() => setCurrentTab('payslips')}
                className="w-full flex items-center justify-between p-4 border border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/5 rounded-xl transition-all group btn-hover-scale text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">My Payslips Directory</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">Download historical payslip PDFs</span>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
              </button>

              <button 
                onClick={() => setCurrentTab('my-attendance')}
                className="w-full flex items-center justify-between p-4 border border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/5 rounded-xl transition-all group btn-hover-scale text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                    <CalendarClock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">Attendance & Schedule</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">View shifts and attendance logs</span>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
              </button>
            </div>
          </div>

          {/* Assigned Shift details */}
          <div className="bg-white p-6 border border-slate-200/80 rounded-xl shadow-card flex flex-col justify-between glass-card-hover animate-slide-up stagger-3">
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-4">Assigned Shift</h2>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center space-x-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 block">{employeeDetails?.shift || 'Morning Shift'}</span>
                  <span className="text-xs text-slate-500 block mt-0.5 font-semibold">08:00 AM - 05:00 PM</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">Branch: SuperMart HQ</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-slate-100 pt-4 mt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Personal Profile info</span>
              <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Employee ID</span>
                  <span className="text-slate-700 font-bold mt-0.5 block">{employeeDetails?.employeeNumber || 'EMP001'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Department</span>
                  <span className="text-slate-700 font-bold mt-0.5 block">{employeeDetails?.department || 'Sales'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Job Title</span>
                  <span className="text-slate-700 font-bold mt-0.5 block">{employeeDetails?.position || 'Sales Assistant'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Type</span>
                  <span className="text-slate-700 font-bold mt-0.5 block">Full Time</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Bottom Row: Recent clock-ins & salary advances */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Clock-ins logs */}
          <div className="bg-white p-6 border border-slate-200/80 rounded-xl shadow-card flex flex-col glass-card-hover animate-slide-up stagger-2">
            <h2 className="text-base font-bold text-slate-800 mb-4">My Recent Attendance</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-400">
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Shift</th>
                    <th className="py-2.5">Clock In</th>
                    <th className="py-2.5">Clock Out</th>
                    <th className="py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                  {mockPersonalLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 font-mono">{log.date}</td>
                      <td className="py-3 text-slate-500 font-medium">{log.shift}</td>
                      <td className="py-3 font-mono">{log.in}</td>
                      <td className="py-3 font-mono">{log.out}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          log.status.includes('Active')
                            ? 'bg-emerald-100 text-emerald-700 animate-pulse'
                            : log.status === 'Present'
                              ? 'bg-emerald-50 text-emerald-600'
                              : log.status === 'Late'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-500'
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

          {/* Salary Advance History */}
          <div className="bg-white p-6 border border-slate-200/80 rounded-xl shadow-card flex flex-col glass-card-hover animate-slide-up stagger-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800">My Salary Advances</h2>
              <button 
                onClick={() => setCurrentTab('request-advance')} 
                className="text-xs font-bold text-[var(--brand-green)] hover:text-[#0c8a50]"
              >
                Apply New
              </button>
            </div>
            {personalAdvances.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <HandCoins className="w-8 h-8 text-slate-200 mb-2" />
                <span className="text-xs font-bold">No salary advances requested yet.</span>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold text-slate-400">
                      <th className="py-2.5">Request Date</th>
                      <th className="py-2.5">Amount</th>
                      <th className="py-2.5">Repayment</th>
                      <th className="py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                    {personalAdvances.map((adv, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3 font-mono">{adv.requestDate}</td>
                        <td className="py-3 font-bold">KES {adv.amount.toLocaleString()}</td>
                        <td className="py-3 text-slate-500 font-medium">{adv.repaymentPeriod} Month(s)</td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            adv.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-700'
                              : adv.status === 'APPROVED'
                                ? 'bg-blue-100 text-blue-700'
                                : adv.status === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-rose-100 text-rose-700'
                          }`}>
                            {adv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium">
            Overview of your company's payroll and operations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold px-4 py-2.5 rounded-lg text-sm transition-all shadow-sm btn-hover-scale">
            <FileDown className="w-4 h-4" />
            <span>Download Report</span>
          </button>
          {role !== 'ACCOUNTANT' && (
            <button 
              onClick={() => setCurrentTab('payroll-processing')}
              className="flex items-center space-x-2 bg-[var(--brand-green)] hover:bg-[#0c8a50] text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-all shadow-sm btn-hover-scale"
            >
              <Plus className="w-4 h-4" />
              <span>Run Payroll</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Employees */}
        <div 
          onClick={() => setCurrentTab('employees')}
          className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-card flex items-center space-x-4 glass-card-hover animate-slide-up stagger-1 cursor-pointer hover:border-purple-500/30 transition-all"
        >
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-xs text-slate-400 block font-bold">Total Employees</span>
            {loading ? <Skeleton className="h-6 w-16 mt-1" /> : <span className="text-2xl font-bold text-slate-800 leading-none mt-1 block">{stats.totalEmployees}</span>}
            <span className="text-[10px] text-slate-400 block mt-1 font-semibold">
              Active Employees <span className="text-emerald-600 font-bold">↑ 12 this month</span>
            </span>
          </div>
        </div>

        {/* Total Payroll */}
        <div 
          onClick={() => setCurrentTab('payroll-processing')}
          className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-card flex items-center space-x-4 glass-card-hover animate-slide-up stagger-1 cursor-pointer hover:border-emerald-500/30 transition-all"
        >
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-xs text-slate-400 block font-bold">Total Payroll (May)</span>
            {loading ? <Skeleton className="h-6 w-24 mt-1" /> : (
              <span className="text-xl font-bold text-slate-800 leading-none mt-1 block">
                KES {stats.totalPayrollAmount.toLocaleString()}
              </span>
            )}
            <span className="text-[10px] text-slate-400 block mt-1 font-semibold">
              Total salary cost <span className="text-emerald-600 font-bold">↑ 8.5% from last month</span>
            </span>
          </div>
        </div>

        {/* Paid Employees */}
        <div 
          onClick={() => setCurrentTab('bulk-payments')}
          className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-card flex items-center space-x-4 glass-card-hover animate-slide-up stagger-2 cursor-pointer hover:border-blue-500/30 transition-all"
        >
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-xs text-slate-400 block font-bold">Paid Employees</span>
            {loading ? <Skeleton className="h-6 w-16 mt-1" /> : <span className="text-2xl font-bold text-slate-800 leading-none mt-1 block">{stats.paidEmployees}</span>}
            <span className="text-[10px] text-slate-400 block mt-1 font-semibold">
              Employees paid <span className="text-emerald-600 font-bold">76.9% of total</span>
            </span>
          </div>
        </div>

        {/* Pending Payments */}
        <div 
          onClick={() => setCurrentTab('bulk-payments')}
          className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-card flex items-center space-x-4 glass-card-hover animate-slide-up stagger-2 cursor-pointer hover:border-amber-500/30 transition-all"
        >
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-xs text-slate-400 block font-bold">Pending Payments</span>
            {loading ? <Skeleton className="h-6 w-16 mt-1" /> : <span className="text-2xl font-bold text-slate-800 leading-none mt-1 block">{stats.pendingEmployees}</span>}
            {loading ? <Skeleton className="h-3 w-20 mt-1" /> : (
              <span className="text-[10px] text-slate-500 font-bold block mt-1">
                KES {stats.pendingAmount.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Total Branches */}
        <div 
          onClick={() => setCurrentTab('branches')}
          className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-card flex items-center space-x-4 glass-card-hover animate-slide-up stagger-3 cursor-pointer hover:border-pink-500/30 transition-all"
        >
          <div className="p-3 bg-pink-100 text-pink-600 rounded-xl">
            <GitBranch className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-xs text-slate-400 block font-bold">Total Branches</span>
            {loading ? <Skeleton className="h-6 w-12 mt-1" /> : <span className="text-2xl font-bold text-slate-800 leading-none mt-1 block">{stats.totalBranches}</span>}
            <span className="text-[10px] text-emerald-600 font-bold block mt-1 uppercase tracking-wider">Active</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Line Chart & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white p-6 border border-slate-200/80 rounded-xl shadow-card flex flex-col glass-card-hover animate-slide-up stagger-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-800">Payroll Overview</h2>
            <select className="text-xs border border-slate-200 bg-white rounded px-2.5 py-1.5 outline-none font-bold text-slate-500 cursor-pointer focus:ring-1 focus:ring-emerald-500">
              <option>6 Months</option>
              <option>1 Year</option>
            </select>
          </div>
          <div className="h-64 flex-1">
            {loading ? <Skeleton className="w-full h-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tickLine={false} stroke="#94a3b8" style={{ fontSize: 12, fontWeight: 600 }} />
                  <YAxis yAxisId="left" tickLine={false} axisLine={false} stroke="#94a3b8" style={{ fontSize: 12, fontWeight: 600 }} />
                  <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} stroke="#94a3b8" style={{ fontSize: 12, fontWeight: 600 }} />
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10, fontWeight: 600 }} />
                  <Line yAxisId="left" type="monotone" dataKey="payrollAmount" name="Payroll Amount (KES)" stroke="#0fa361" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="employeeCount" name="Employees" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Payments List */}
        <div className="bg-white p-6 border border-slate-200/80 rounded-xl shadow-card flex flex-col glass-card-hover animate-slide-up stagger-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-800">Recent Payments</h2>
            <button 
              onClick={() => setCurrentTab('bulk-payments')} 
              className="text-xs font-bold text-[var(--brand-green)] hover:text-[#0c8a50]"
            >
              View All
            </button>
          </div>
          <div className="flex-1 space-y-4">
            {/* Row 1 */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <div>
                  <span className="text-sm font-bold text-slate-800 block">May 2024 Payroll</span>
                  <span className="text-xs text-slate-400 block mt-0.5 font-medium">Paid on 25 May 2024, 10:30 AM</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-800 block">KES 1,910,000</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 mt-1 inline-block">
                  Completed
                </span>
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <div>
                  <span className="text-sm font-bold text-slate-800 block">April 2024 Payroll</span>
                  <span className="text-xs text-slate-400 block mt-0.5 font-medium">Paid on 25 April 2024, 09:15 AM</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-800 block">KES 1,750,000</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 mt-1 inline-block">
                  Completed
                </span>
              </div>
            </div>

            {/* Row 3 */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <div>
                  <span className="text-sm font-bold text-slate-800 block">May 2024 Bonuses</span>
                  <span className="text-xs text-slate-400 block mt-0.5 font-medium">Processing payment</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-800 block">KES 180,000</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 mt-1 inline-block">
                  Pending
                </span>
              </div>
            </div>

            {/* Row 4 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <div>
                  <span className="text-sm font-bold text-slate-800 block">May 2024 Deductions</span>
                  <span className="text-xs text-slate-400 block mt-0.5 font-medium">Scheduled for 30 May 2024</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-800 block">KES 40,000</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 mt-1 inline-block">
                  Scheduled
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Department Summary, Quick Actions, Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Summary Donut Chart */}
        <div className="bg-white p-6 border border-slate-200/80 rounded-xl shadow-card flex flex-col glass-card-hover animate-slide-up stagger-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">Department Summary</h2>
            <button 
              onClick={() => setCurrentTab('reports')}
              className="text-xs font-bold text-[var(--brand-green)] hover:text-[#0c8a50] transition-colors"
            >
              View Report
            </button>
          </div>
          
          <div className="flex flex-row items-center justify-between flex-1">
            {/* Pie Chart container */}
            <div className="w-36 h-36 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-none">Total Payroll</span>
                <span className="text-sm font-extrabold text-slate-800 block mt-1 leading-none">KES 2.45M</span>
              </div>
            </div>

            {/* Pie Chart Legend */}
            <div className="flex-1 pl-4 space-y-1.5">
              {deptData.map((d, index) => (
                <div key={index} className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                    <span className="text-slate-500 truncate font-semibold">{d.name}</span>
                  </div>
                  <div className="text-right pl-2">
                    <span className="font-bold text-slate-800 block">KES {(d.value / 1000).toFixed(0)}k</span>
                    <span className="text-[10px] text-slate-400 block font-medium">{d.percentage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="bg-white p-6 border border-slate-200/80 rounded-xl shadow-card flex flex-col glass-card-hover animate-slide-up stagger-3">
          <h2 className="text-base font-bold text-slate-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-4 flex-1">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button 
                  key={action.id}
                  onClick={action.action}
                  className="flex flex-col items-center justify-center p-3 border border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/10 rounded-xl transition-all group btn-hover-scale"
                >
                  <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg group-hover:bg-emerald-100 group-hover:text-[var(--brand-green)] transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 mt-2 text-center group-hover:text-emerald-700 transition-colors">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upcoming Tasks Card */}
        <div className="bg-white p-6 border border-slate-200/80 rounded-xl shadow-card flex flex-col glass-card-hover animate-slide-up stagger-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-800">Upcoming Tasks</h2>
            <button 
              onClick={() => setCurrentTab('payroll-processing')}
              className="text-xs font-bold text-[var(--brand-green)] hover:text-[#0c8a50] transition-colors"
            >
              View All
            </button>
          </div>
          <div className="flex-1 space-y-4">
            {/* Task 1 */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Run May 2024 Payroll</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">Due on 25 May 2024</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                Today
              </span>
            </div>

            {/* Task 2 */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Approve Bonuses</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">Due on 28 May 2024</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                In 3 days
              </span>
            </div>

            {/* Task 3 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                  <FileDown className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Generate Payslips</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">Due on 30 May 2024</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                In 5 days
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
