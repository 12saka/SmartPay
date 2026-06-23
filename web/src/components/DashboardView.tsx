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
import { reportService } from '../services/api';
import { Skeleton } from './ui/Skeleton';

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

  useEffect(() => {
    async function loadStats() {
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
    loadStats();
  }, [selectedBranchId]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium">Welcome back, John Manager 👋</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold px-4 py-2.5 rounded-lg text-sm transition-all shadow-sm btn-hover-scale">
            <FileDown className="w-4 h-4" />
            <span>Download Report</span>
          </button>
          <button 
            onClick={() => setCurrentTab('payroll')}
            className="flex items-center space-x-2 bg-[var(--brand-green)] hover:bg-[#0c8a50] text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-all shadow-sm btn-hover-scale"
          >
            <Plus className="w-4 h-4" />
            <span>Run Payroll</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Employees */}
        <div className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-card flex items-center space-x-4 glass-card-hover animate-slide-up stagger-1">
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
        <div className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-card flex items-center space-x-4 glass-card-hover animate-slide-up stagger-1">
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
        <div className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-card flex items-center space-x-4 glass-card-hover animate-slide-up stagger-2">
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
        <div className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-card flex items-center space-x-4 glass-card-hover animate-slide-up stagger-2">
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
        <div className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-card flex items-center space-x-4 glass-card-hover animate-slide-up stagger-3">
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
              onClick={() => setCurrentTab('payments')} 
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
            <button className="text-xs font-bold text-[var(--brand-green)] hover:text-[#0c8a50] transition-colors">View Report</button>
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
            {/* Add Employee */}
            <button 
              onClick={() => setCurrentTab('employees')}
              className="flex flex-col items-center justify-center p-3 border border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/10 rounded-xl transition-all group btn-hover-scale"
            >
              <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg group-hover:bg-emerald-100 group-hover:text-[var(--brand-green)] transition-colors">
                <UserPlus className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-600 mt-2 text-center group-hover:text-emerald-700 transition-colors">
                Add Employee
              </span>
            </button>

            {/* Run Payroll */}
            <button 
              onClick={() => setCurrentTab('payroll')}
              className="flex flex-col items-center justify-center p-3 border border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/10 rounded-xl transition-all group btn-hover-scale"
            >
              <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg group-hover:bg-emerald-100 group-hover:text-[var(--brand-green)] transition-colors">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-600 mt-2 text-center group-hover:text-emerald-700 transition-colors">
                Run Payroll
              </span>
            </button>

            {/* Bulk Payment */}
            <button 
              onClick={() => setCurrentTab('payments')}
              className="flex flex-col items-center justify-center p-3 border border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/10 rounded-xl transition-all group btn-hover-scale"
            >
              <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg group-hover:bg-emerald-100 group-hover:text-[var(--brand-green)] transition-colors">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-600 mt-2 text-center group-hover:text-emerald-700 transition-colors">
                Bulk Payment
              </span>
            </button>

            {/* Add Advance */}
            <button 
              onClick={() => setCurrentTab('advances')}
              className="flex flex-col items-center justify-center p-3 border border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/10 rounded-xl transition-all group btn-hover-scale"
            >
              <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg group-hover:bg-emerald-100 group-hover:text-[var(--brand-green)] transition-colors">
                <Plus className="w-5 h-5" strokeWidth={3} />
              </div>
              <span className="text-xs font-bold text-slate-600 mt-2 text-center group-hover:text-emerald-700 transition-colors">
                Add Advance
              </span>
            </button>

            {/* Upload Attendance */}
            <button 
              onClick={() => setCurrentTab('attendance')}
              className="flex flex-col items-center justify-center p-3 border border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/10 rounded-xl transition-all group btn-hover-scale"
            >
              <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg group-hover:bg-emerald-100 group-hover:text-[var(--brand-green)] transition-colors">
                <CalendarClock className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-600 mt-2 text-center group-hover:text-emerald-700 transition-colors">
                Upload Attendance
              </span>
            </button>

            {/* Generate Payslips */}
            <button 
              onClick={() => setCurrentTab('payslips')}
              className="flex flex-col items-center justify-center p-3 border border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/10 rounded-xl transition-all group btn-hover-scale"
            >
              <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg group-hover:bg-emerald-100 group-hover:text-[var(--brand-green)] transition-colors">
                <FileCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-600 mt-2 text-center group-hover:text-emerald-700 transition-colors">
                Generate Payslips
              </span>
            </button>
          </div>
        </div>

        {/* Upcoming Tasks Card */}
        <div className="bg-white p-6 border border-slate-200/80 rounded-xl shadow-card flex flex-col glass-card-hover animate-slide-up stagger-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-800">Upcoming Tasks</h2>
            <button className="text-xs font-bold text-[var(--brand-green)] hover:text-[#0c8a50] transition-colors">View All</button>
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
