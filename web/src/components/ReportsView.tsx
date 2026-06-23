import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  GitBranch, 
  Users, 
  Filter,
  CheckCircle
} from 'lucide-react';

export default function ReportsView() {
  const [reportType, setReportType] = useState('payroll_summary');
  const [format, setFormat] = useState('PDF');
  const [branch, setBranch] = useState('ALL');
  const [department, setDepartment] = useState('ALL');
  const [dateRange, setDateRange] = useState('2026-06');
  const [generating, setGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const reportTypes = [
    { id: 'payroll_summary', label: 'Consolidated Payroll Summary', desc: 'Overview of gross salary, statutory deductions, advances, and net payments.' },
    { id: 'employee_payslips', label: 'Employee Bulk Payslips', desc: 'Bulk individual employee payslips compiled into a single document.' },
    { id: 'department_reports', label: 'Department Cost Report', desc: 'Expenditure breakdowns grouped by department efficiency ratios.' },
    { id: 'branch_reports', label: 'Branch Cost Comparison', desc: 'Payroll costs comparison across Nairobi, Nakuru, Eldoret, and Kisumu.' },
    { id: 'tax_reports', label: 'Statutory Tax Returns (PAYE/NHIF/NSSF)', desc: 'Pre-formatted statutory return files matching KRA/SHIF portals requirements.' },
    { id: 'audit_reports', label: 'Audit Security History', desc: 'Platform activity, settings changes, and compliance audit trail.' },
    { id: 'attendance_reports', label: 'Attendance & Overtime Ledger', desc: 'Clock-in checklists, total overtime claims, and check-in audits.' },
    { id: 'advance_reports', label: 'Salary Advances Ledger', desc: 'Outstanding salary advances balances and scheduled auto-deductions.' }
  ];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setGenerating(true);

    setTimeout(() => {
      setGenerating(false);
      const activeReport = reportTypes.find(r => r.id === reportType)?.label || 'Report';
      setSuccessMsg(`Success! your ${activeReport} has been prepared and downloaded in ${format} format.`);
    }, 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">Reports Center</h1>
        <p className="text-sm text-slate-500">Extract statutory logs, department sheets, and payroll registers in multiple formats</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-sm font-semibold flex items-center space-x-3 shadow-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Selecting Report type */}
        <div className="lg:col-span-2 bg-white p-6 border border-slate-200/80 rounded-xl shadow-card flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 mb-2">1. Select Report Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map((r) => {
                const isActive = reportType === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => { setReportType(r.id); setSuccessMsg(''); }}
                    className={`text-left p-4 rounded-xl border text-sm font-semibold transition-all ${
                      isActive 
                        ? 'bg-emerald-50/20 border-emerald-600 text-slate-900 shadow-sm' 
                        : 'border-slate-100 hover:border-slate-200 text-slate-700 bg-slate-50/30'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <FileText className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className="font-bold">{r.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1.5 leading-relaxed">{r.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Filters & Generate */}
        <div className="bg-white p-6 border border-slate-200/80 rounded-xl shadow-card flex flex-col justify-between">
          <form onSubmit={handleGenerate} className="space-y-5 flex flex-col h-full justify-between">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                <span>2. Customize Filters</span>
              </h3>

              {/* Date Range */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Payroll Period</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    type="month"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full text-sm pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-700"
                  />
                </div>
              </div>

              {/* Branch Filter */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Select Branch</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <GitBranch className="w-4 h-4" />
                  </span>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full text-sm pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-700 cursor-pointer"
                  >
                    <option value="ALL">All Branches (HQ)</option>
                    <option value="1">Nairobi CBD Branch</option>
                    <option value="2">Nakuru Branch</option>
                    <option value="3">Eldoret Depot</option>
                    <option value="4">Kisumu Outlet</option>
                  </select>
                </div>
              </div>

              {/* Department Filter */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Select Department</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Users className="w-4 h-4" />
                  </span>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-sm pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-700 cursor-pointer"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="Sales">Sales</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Security">Security</option>
                  </select>
                </div>
              </div>

              {/* Export Format */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-2">Export Format</label>
                <div className="flex space-x-3">
                  {['PDF', 'EXCEL', 'CSV'].map((f) => (
                    <button
                      type="button"
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                        format === f 
                          ? 'bg-slate-900 border-slate-900 text-white' 
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-sm btn-hover-scale"
            >
              {generating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Generating Report...</span>
                </>
              ) : (
                <>
                  <Download className="w-4.5 h-4.5" />
                  <span>Download {format} Report</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
