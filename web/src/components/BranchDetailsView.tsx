import React, { useState, useEffect } from 'react';
import { branchService, employeeService } from '../services/api';
import EmployeeProfileView from './EmployeeProfileView';

interface BranchDetailsViewProps {
  selectedBranchId: number | null;
  setCurrentTab: (tab: string) => void;
  currentUser?: any;
}

export default function BranchDetailsView({
  selectedBranchId,
  setCurrentTab,
  currentUser
}: BranchDetailsViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [branch, setBranch] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Sub views
  const [selectedSubEmployee, setSelectedSubEmployee] = useState<any | null>(null);

  // Settings tab form states
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    status: 'ACTIVE',
    managerName: 'John Miller',
    managerEmail: 'manager@smartpay.com',
    assistantManager: 'Alice Wambui',
    mpesaChannel: 'B2C-PAYROLL-8809',
    allowCasualsToClock: true
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Toast simulations
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadBranchData();
  }, [selectedBranchId]);

  async function loadBranchData() {
    if (selectedBranchId === null) {
      // Default to HQ simulation
      setBranch({
        id: 0,
        name: 'SuperMart HQ (Supervision View)',
        location: 'Mombasa Road, Nairobi, Kenya',
        code: 'BR-000',
        status: 'ACTIVE',
        established: '2023-01-01',
        manager: 'Jane Doe',
        contact: 'hq@supermart.co.ke'
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [branchList, empList] = await Promise.all([
        branchService.getAll().catch(() => []),
        employeeService.getAll({ branchId: selectedBranchId }).catch(() => [])
      ]);

      const branchData = branchList.find((b: any) => b.id === selectedBranchId);

      if (branchData) {
        setBranch({
          ...branchData,
          code: `BR-${branchData.id.toString().padStart(3, '0')}`,
          established: '12 January 2024',
          manager: branchData.id % 2 === 0 ? 'Alice Wambui' : 'John Miller',
          contact: branchData.id % 2 === 0 ? 'alice@smartpay.com' : 'manager@smartpay.com'
        });
        setFormData({
          name: branchData.name,
          location: branchData.location || 'Nairobi CBD',
          status: 'ACTIVE',
          managerName: branchData.id % 2 === 0 ? 'Alice Wambui' : 'John Miller',
          managerEmail: branchData.id % 2 === 0 ? 'alice@smartpay.com' : 'manager@smartpay.com',
          assistantManager: 'Sarah Mwangi',
          mpesaChannel: `B2C-PAY-${1000 + branchData.id}`,
          allowCasualsToClock: true
        });
      } else {
        // Mock fallback if API error
        setBranch({
          id: selectedBranchId,
          name: `Branch Office #${selectedBranchId}`,
          location: 'Nairobi Branch Area',
          code: `BR-${selectedBranchId.toString().padStart(3, '0')}`,
          status: 'ACTIVE',
          established: '12 January 2024',
          manager: 'John Miller',
          contact: 'manager@smartpay.com'
        });
      }

      setEmployees(empList);
    } catch (err) {
      console.error('Failed to load branch details dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  // Handle Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNotes(true);
    setIsSavingSettings(true);
    setTimeout(() => {
      setIsSavingSettings(false);
      setSettingsSaved(true);
      setBranch((prev: any) => ({
        ...prev,
        name: formData.name,
        location: formData.location,
        manager: formData.managerName,
        contact: formData.managerEmail
      }));
      triggerToast('Branch Settings Saved', 'Configuration successfully synchronized to branch registry.');
      setTimeout(() => setSettingsSaved(false), 2000);
    }, 600);
  };

  const setIsSavingNotes = (val: boolean) => {};

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-xs font-bold animate-pulse">Loading Branch Details Dashboard...</div>;
  }

  if (!branch) {
    return (
      <div className="p-12 text-center border border-slate-200 rounded-2xl bg-white space-y-3">
        <h2 className="text-sm font-bold text-slate-800">Branch Details Unavailable</h2>
        <p className="text-xs text-slate-400 font-semibold">Please select a branch from the sidebar footer to view its dashboard.</p>
        <button onClick={() => setCurrentTab('dashboard')} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors">
          Go to Dashboard
        </button>
      </div>
    );
  }

  // Filtered employees for this branch
  const filteredEmployees = employees.filter(emp => {
    const term = search.toLowerCase();
    return (
      emp.fullName.toLowerCase().includes(term) ||
      emp.employeeNumber.toLowerCase().includes(term) ||
      emp.position.toLowerCase().includes(term)
    );
  });

  // Calculate stats based on employees
  const totalSalaries = employees.reduce((sum, e) => sum + e.salary, 0);
  const activeCount = employees.filter(e => e.status === 'ACTIVE').length;
  const attendanceRate = '96.2%';
  const pendingApprovals = 2;

  // Render Sub-Employee Profile View
  if (selectedSubEmployee) {
    return (
      <EmployeeProfileView
        employee={selectedSubEmployee}
        onBack={() => { setSelectedSubEmployee(null); loadBranchData(); }}
        onEdit={() => { triggerToast('Action Blocked', 'Click Edit in the Employees Directory view.'); }}
        onToggleStatus={async (id, currentStatus) => {
          try {
            const { employeeService } = await import('../services/api');
            const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
            await employeeService.toggleStatus(id, nextStatus);
            setSelectedSubEmployee((prev: any) => ({ ...prev, status: nextStatus }));
            triggerToast('Status Updated', 'Employee active state updated.');
          } catch (e) {
            triggerToast('Action Failed', 'Failed to toggle employee status.', 'error');
          }
        }}
        branches={[branch]}
        successToast={(title, msg) => triggerToast(title, msg)}
        errorToast={(title, msg) => triggerToast(title, msg, 'error')}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Toast Alert Banner */}
      {toast && (
        <div className={`fixed top-4 right-4 p-4 border rounded-xl z-50 shadow-lg text-xs font-semibold flex items-center space-x-2 animate-fade-in ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <span>{toast.type === 'success' ? '✓' : '⚠'}</span>
          <div>
            <strong className="block">{toast.title}</strong>
            <span className="block mt-0.5 font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Back to list header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <button 
          onClick={() => setCurrentTab('branches')}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          ← Back to Branches Directory
        </button>
        <span className="text-xs font-bold text-slate-400">
          SuperMart Retail Chains Ltd
        </span>
      </div>

      {/* Main Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{branch.name}</h1>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              formData.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {formData.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">Branch Code: {branch.code} • Manager: {branch.manager} • Location: {branch.location}</p>
        </div>
      </div>

      {/* KPI Cards section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-slate-200/80 rounded-xl shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Monthly Payroll</span>
          <span className="text-xl font-bold text-slate-800 block mt-1">KES {totalSalaries.toLocaleString()}</span>
          <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Sum of {employees.length} salaries</span>
        </div>
        <div className="bg-white p-4 border border-slate-200/80 rounded-xl shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Staff</span>
          <span className="text-xl font-bold text-slate-800 block mt-1">{activeCount} / {employees.length}</span>
          <span className="text-[9px] text-emerald-600 font-semibold block mt-0.5">All credentials complete</span>
        </div>
        <div className="bg-white p-4 border border-slate-200/80 rounded-xl shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Attendance Average</span>
          <span className="text-xl font-bold text-slate-800 block mt-1">{attendanceRate}</span>
          <span className="text-[9px] text-emerald-600 font-semibold block mt-0.5">Active period average</span>
        </div>
        <div className="bg-white p-4 border border-slate-200/80 rounded-xl shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Approvals</span>
          <span className="text-xl font-bold text-amber-600 block mt-1">{pendingApprovals}</span>
          <span className="text-[9px] text-amber-600 font-semibold block mt-0.5">Advances & leave requests</span>
        </div>
      </div>

      {/* Tabs Selection */}
      <div className="border-b border-slate-200 flex flex-wrap gap-1">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'employees', label: 'Employees' },
          { id: 'payroll', label: 'Payroll Overview' },
          { id: 'attendance', label: 'Attendance & Shifts' },
          { id: 'reports', label: 'Reports & Expenses' },
          { id: 'settings', label: 'Settings' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2.5 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id 
                ? 'border-emerald-600 text-emerald-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Panel */}
      <div className="bg-white p-6 border border-slate-200/80 rounded-2xl shadow-card">
        
        {/* 1. Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Branch Information */}
              <div className="border border-slate-100 p-4 rounded-xl space-y-3.5 text-xs font-semibold text-slate-600">
                <h3 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2">Branch Registration Details</h3>
                <div className="flex justify-between">
                  <span>Branch Name:</span>
                  <span className="text-slate-800 font-bold">{branch.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Branch Code:</span>
                  <span className="text-slate-800 font-mono">{branch.code}</span>
                </div>
                <div className="flex justify-between">
                  <span>Established Date:</span>
                  <span className="text-slate-800">{branch.established}</span>
                </div>
                <div className="flex justify-between">
                  <span>Branch Manager:</span>
                  <span className="text-slate-800">{branch.manager}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contact Email:</span>
                  <span className="text-slate-800 font-mono">{branch.contact}</span>
                </div>
                <div className="flex justify-between">
                  <span>Location Address:</span>
                  <span className="text-slate-800">{branch.location}</span>
                </div>
              </div>

              {/* Announcements panel */}
              <div className="border border-slate-100 p-4 rounded-xl space-y-3">
                <h3 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2">Branch Notifications & Bulletin</h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-lg text-blue-900 font-semibold">
                    <span className="text-[9px] uppercase font-bold text-blue-500 block">Announced Today</span>
                    <span className="block mt-0.5">Biometric checks update: Please ensure all cashiers clock out before 10 PM.</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 font-semibold">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">2 days ago</span>
                    <span className="block mt-0.5">Inventory Audit scheduled for this Saturday from 06:00 PM. Attendance mandatory.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activities Timeline */}
            <div className="border border-slate-150 p-4 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2">Branch Activity Audit Trails</h3>
              <div className="space-y-4 relative border-l border-slate-100 pl-4 ml-2.5 py-1 text-xs font-semibold">
                <div className="relative">
                  <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                  <div className="text-slate-800 font-bold">Branch settings updated</div>
                  <div className="text-[10px] text-slate-400 block mt-0.5">Completed by Admin • Today, 08:30 AM</div>
                </div>
                <div className="relative">
                  <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                  <div className="text-slate-800 font-bold">Bulk payroll draft approved for the branch</div>
                  <div className="text-[10px] text-slate-400 block mt-0.5">Approved by John Miller (Manager) • Yesterday, 04:15 PM</div>
                </div>
                <div className="relative">
                  <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                  <div className="text-slate-800 font-bold">New employee (David Kimani) assigned to Nairobi CBD</div>
                  <div className="text-[10px] text-slate-400 block mt-0.5">Registered by Admin • 2 weeks ago</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Employees Tab */}
        {activeTab === 'employees' && (
          <div className="space-y-4">
            {/* Search Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
              <input
                type="text"
                placeholder="Search staff in this branch by name, position..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-xs border border-slate-200 bg-white rounded-lg p-2 max-w-sm w-full outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-400 font-semibold">{filteredEmployees.length} Staff assigned</span>
            </div>

            {/* Employees list Table */}
            <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="p-3">Emp ID</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Position</th>
                    <th className="p-3">Payment Method</th>
                    <th className="p-3">Basic Salary</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                  {filteredEmployees.map((emp) => (
                    <tr 
                      key={emp.id} 
                      onClick={() => setSelectedSubEmployee(emp)}
                      className="hover:bg-slate-50/50 cursor-pointer hover:text-emerald-700"
                    >
                      <td className="p-3 font-mono">{emp.employeeNumber}</td>
                      <td className="p-3">{emp.fullName}</td>
                      <td className="p-3">{emp.position}</td>
                      <td className="p-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          emp.paymentMethod === 'MPESA' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {emp.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-800">KES {emp.salary.toLocaleString()}</td>
                      <td className="p-3 text-right">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          emp.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 font-bold">No employee records match the search.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Payroll Tab */}
        {activeTab === 'payroll' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Financial numbers */}
              <div className="border border-slate-100 p-4 rounded-xl space-y-3.5 text-xs font-semibold text-slate-600 bg-slate-50/30">
                <h3 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2">Active Cycle Payroll Summary</h3>
                <div className="flex justify-between">
                  <span>Current Period:</span>
                  <span className="text-slate-800 font-bold">June 2026</span>
                </div>
                <div className="flex justify-between">
                  <span>Salaries Payable:</span>
                  <span className="text-slate-800">KES {totalSalaries.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Overtime & Bonuses:</span>
                  <span>+ KES 48,750</span>
                </div>
                <div className="flex justify-between text-rose-600 border-b border-slate-150 pb-2">
                  <span>Statutory Taxes & Deductions:</span>
                  <span>- KES 15,200</span>
                </div>
                <div className="flex justify-between text-slate-800 font-extrabold text-sm pt-1">
                  <span>Total Net Payout:</span>
                  <span>KES {(totalSalaries + 48750 - 15200).toLocaleString()}</span>
                </div>
              </div>

              {/* Disbursement Status */}
              <div className="border border-slate-100 p-4 rounded-xl space-y-3.5 text-xs font-semibold text-slate-500">
                <h3 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2">Disbursement Channel Status</h3>
                <div className="flex justify-between">
                  <span>Active Channel:</span>
                  <span className="text-slate-850 font-bold">M-Pesa B2C Bulk Gate</span>
                </div>
                <div className="flex justify-between">
                  <span>Account Number:</span>
                  <span className="text-slate-850 font-mono font-bold">{formData.mpesaChannel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fund Settlement status:</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">FLOAT READY</span>
                </div>
                <div className="flex justify-between">
                  <span>Payout cycle date:</span>
                  <span className="text-slate-800">28th of every month</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={() => triggerToast('Settlement Initiated', 'Bulk branch B2C payout instruction queued.')}
                    className="bg-[var(--brand-green)] hover:bg-[#0c8a50] text-white text-[10px] font-bold py-1.5 px-3 rounded-lg"
                  >
                    Execute Branch Payout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {/* Shifts list */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/20">
                <h4 className="text-xs font-extrabold text-slate-800">Morning Shift</h4>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Hours: 08:00 AM - 05:00 PM</span>
                <span className="text-lg font-extrabold text-slate-800 block mt-2">5 Staff assigned</span>
              </div>
              <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/20">
                <h4 className="text-xs font-extrabold text-slate-800">Afternoon Shift</h4>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Hours: 01:00 PM - 10:00 PM</span>
                <span className="text-lg font-extrabold text-slate-800 block mt-2">4 Staff assigned</span>
              </div>
              <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/20">
                <h4 className="text-xs font-extrabold text-slate-800">Night Shift</h4>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Hours: 10:00 PM - 07:00 AM</span>
                <span className="text-lg font-extrabold text-slate-800 block mt-2">3 Staff assigned</span>
              </div>
            </div>

            {/* Attendance metrics */}
            <div className="border border-slate-100 p-4 rounded-xl space-y-3 pt-4 text-xs font-semibold text-slate-500">
              <h3 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2">Shift Attendance Status</h3>
              <div className="flex justify-between">
                <span>Present staff today:</span>
                <span className="text-slate-800">11 Present</span>
              </div>
              <div className="flex justify-between">
                <span>Absent today:</span>
                <span className="text-rose-600 font-bold">1 Absent (Unexcused)</span>
              </div>
              <div className="flex justify-between">
                <span>Accumulated Overtime:</span>
                <span className="text-emerald-600 font-bold">32.5 Hours this month</span>
              </div>
            </div>
          </div>
        )}

        {/* 5. Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Financial Expenses */}
              <div className="border border-slate-100 p-4 rounded-xl space-y-3.5 text-xs font-semibold text-slate-600">
                <h3 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2">Branch Operational Cost</h3>
                <div className="flex justify-between">
                  <span>Branch Premises Rent:</span>
                  <span className="text-slate-800">KES 120,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Electricity & Utilities:</span>
                  <span className="text-slate-800">KES 35,000</span>
                </div>
                <div className="flex justify-between">
                  <span>M-Pesa B2C Float charges:</span>
                  <span className="text-slate-800">KES 18,500</span>
                </div>
                <div className="flex justify-between">
                  <span>Statutory Licensing:</span>
                  <span className="text-slate-800">KES 12,000</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 text-slate-800 font-extrabold text-sm">
                  <span>Total Overhead:</span>
                  <span>KES 185,500</span>
                </div>
              </div>

              {/* Download reports */}
              <div className="border border-slate-100 p-4 rounded-xl space-y-3.5 text-xs font-semibold text-slate-500 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2">Operational Reports</h3>
                  <p className="leading-relaxed font-medium mt-2">Generate monthly summaries of payroll expenses, branch performance indices, and biometric clock-in logs.</p>
                </div>
                <div className="space-y-2 pt-4">
                  <button 
                    onClick={() => triggerToast('Download Started', 'Branch payroll summary ledger generated.')}
                    className="w-full bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold py-2 px-3 rounded-lg transition-all"
                  >
                    Download Payroll PDF Report
                  </button>
                  <button 
                    onClick={() => triggerToast('Download Started', 'Branch attendance log sheet exported.')}
                    className="w-full border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold py-2 px-3 rounded-lg transition-all"
                  >
                    Export Attendance Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. Settings Tab */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6 text-xs font-semibold text-slate-600">
            <h3 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2">Branch Settings & Permissions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-bold">Branch Office Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 font-medium text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-bold">Physical Location Address</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 font-medium text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-bold">Manager In Charge Name</label>
                <input
                  type="text"
                  required
                  value={formData.managerName}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 font-medium text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-bold">Manager Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.managerEmail}
                  onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 font-medium text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-bold">Assign Assistant Manager</label>
                <select
                  value={formData.assistantManager}
                  onChange={(e) => setFormData({ ...formData, assistantManager: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 font-medium text-slate-750 outline-none"
                >
                  <option value="Alice Wambui">Alice Wambui (Accountant)</option>
                  <option value="Sarah Mwangi">Sarah Mwangi (Sales Lead)</option>
                  <option value="Peter Ndwiga">Peter Ndwiga (Store Lead)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-bold">Operating Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 font-medium text-slate-750 outline-none"
                >
                  <option value="ACTIVE">Active (Operating)</option>
                  <option value="MAINTENANCE">Under Maintenance</option>
                  <option value="CLOSED">Closed (Suspended)</option>
                </select>
              </div>
            </div>

            {/* Custom permissions */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 mb-2">Biometric & Clock Permissions</h4>
              <label className="flex items-center space-x-3 text-xs font-semibold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowCasualsToClock}
                  onChange={(e) => setFormData({ ...formData, allowCasualsToClock: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Allow casual/intern employees to log clock shifts at terminal scanners without manager check-in approvals</span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all shadow-sm"
              >
                {settingsSaved ? 'Saved Successfully!' : 'Save Config'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
