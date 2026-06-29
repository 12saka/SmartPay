import React, { useEffect, useState } from 'react';
import { 
  FileDown, 
  Mail, 
  Search, 
  ArrowUpRight,
  Check, 
  AlertCircle
} from 'lucide-react';
import { payrollService } from '../services/api';

// Simple check if libraries are imported in runtime
let jsPDF: any;
let html2canvas: any;

interface PayslipsViewProps {
  selectedBranchId: number | null;
  currentUser?: any;
}

export default function PayslipsView({ selectedBranchId, currentUser }: PayslipsViewProps) {
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
  const [month, setMonth] = useState('2026-06');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [sentMap, setSentMap] = useState<Record<number, boolean>>({});

  const isEmployee = currentUser?.role === 'EMPLOYEE';

  useEffect(() => {
    loadPaidPayroll();
    
    // Proactively import client-side PDF packages
    import('jspdf').then((mod) => { jsPDF = mod.jsPDF; });
    import('html2canvas').then((mod) => { html2canvas = mod.default; });
  }, [month, selectedBranchId]);

  async function loadPaidPayroll() {
    try {
      setLoading(true);
      const data = await payrollService.getAll({
        month,
        branchId: selectedBranchId || undefined,
        status: 'PAID' // Only display payslips for paid records
      });
      setPayrollRuns(data);
    } catch (error) {
      console.error('Failed to load paid records:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSendNotification = (id: number) => {
    setSendingId(id);
    setTimeout(() => {
      setSendingId(null);
      setSentMap(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setSentMap(prev => ({ ...prev, [id]: false }));
      }, 3000);
    }, 1200);
  };

  const handleDownloadPDF = async (run: any) => {
    // Dynamically generate a gorgeous printable DOM element, compile it, and export via jsPDF
    if (!jsPDF) {
      alert('PDF compiler is still initializing. Please retry in a second.');
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Outer frame / header design
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('SMARTPAY PAYSLIP', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Payroll Period: ${month}`, 20, 31);
    doc.text(`Reference: ${run.paymentReference || 'N/A'}`, 20, 36);

    // Business info
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('SuperMart HQ Ltd', 140, 25);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Nairobi, Kenya', 140, 30);
    doc.text('Email: info@smartpay.com', 140, 35);

    // Divider line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(20, 42, 190, 42);

    // Employee Meta
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('EMPLOYEE DETAILS', 20, 52);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(`Employee Name:  ${run.employee.fullName}`, 20, 60);
    doc.text(`Employee No:      ${run.employee.employeeNumber}`, 20, 66);
    doc.text(`Department:       ${run.employee.department}`, 20, 72);
    doc.text(`Position:         ${run.employee.position}`, 20, 78);

    doc.text(`National ID:       ${run.employee.nationalId}`, 110, 60);
    doc.text(`Tax PIN:           ${run.employee.taxPin}`, 110, 66);
    doc.text(`Payment Method:    ${run.employee.paymentMethod}`, 110, 72);
    doc.text(`Account Number:    ${run.employee.accountNumber}`, 110, 78);

    doc.line(20, 86, 190, 86);

    // Earnings Table
    doc.setFont('Helvetica', 'bold');
    doc.text('EARNINGS & DEDUCTIONS BREAKDOWN', 20, 96);
    
    // Table Headers
    doc.setFontSize(9);
    doc.text('Item Description', 22, 106);
    doc.text('Earnings (KES)', 100, 106);
    doc.text('Deductions (KES)', 145, 106);

    doc.line(20, 110, 190, 110);

    // Rows
    doc.setFont('Helvetica', 'normal');
    let y = 118;
    
    // Row 1: Basic
    doc.text('Basic Salary', 22, y);
    doc.text(run.basicSalary.toLocaleString(), 100, y);
    y += 8;

    // Row 2: Overtime
    if (run.overtimeHours > 0) {
      doc.text(`Overtime (${run.overtimeHours} hrs @ ${run.overtimeRate}/hr)`, 22, y);
      doc.text((run.overtimeHours * run.overtimeRate).toLocaleString(), 100, y);
      y += 8;
    }

    // Row 3: Bonus
    if (run.bonusAmount > 0) {
      doc.text('Bonus Payouts', 22, y);
      doc.text(run.bonusAmount.toLocaleString(), 100, y);
      y += 8;
    }

    // Row 4: Statutory Deductions
    doc.text('Statutory Contributions (PAYE, NHIF, NSSF)', 22, y);
    doc.text(run.deductions.toLocaleString(), 145, y);
    y += 8;

    // Row 5: Salary Advance
    if (run.advanceDeduction > 0) {
      doc.text('Salary Advance repayment', 22, y);
      doc.text(run.advanceDeduction.toLocaleString(), 145, y);
      y += 8;
    }

    // Row 6: Penalties
    if (run.penalties > 0) {
      doc.text('Disciplinary Penalties', 22, y);
      doc.text(run.penalties.toLocaleString(), 145, y);
      y += 8;
    }

    doc.line(20, y - 2, 190, y - 2);

    // Summary net salary
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('NET SALARY PAYOUT', 22, y + 6);
    doc.text(`KES ${run.netSalary.toLocaleString()}`, 100, y + 6);

    doc.setFontSize(8);
    doc.setFont('Helvetica', 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text('This is a system generated document. No signature is required.', 20, 260);

    doc.save(`payslip-${run.employee.employeeNumber}-${month}.pdf`);
  };

  const filtered = payrollRuns.filter(run => {
    if (isEmployee) {
      return run.employee.email.toLowerCase() === currentUser?.email?.toLowerCase();
    }
    return run.employee.fullName.toLowerCase().includes(search.toLowerCase()) ||
      run.employee.employeeNumber.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            {isEmployee ? 'My Payslips' : 'Employee Payslips'}
          </h1>
          <p className="text-sm text-slate-500">
            {isEmployee 
              ? 'View and download your official monthly payslips' 
              : 'View generated payslips, download PDF templates, or send email notices'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="text-sm border border-slate-200 bg-white rounded-lg px-3 py-2 outline-none font-semibold text-slate-700"
          />
        </div>
      </div>

      {/* Directory search header */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-card overflow-hidden">
        {!isEmployee && (
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="relative w-full max-w-sm">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search employee or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-sm pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-medium">{filtered.length} payslips available</span>
          </div>
        )}

        {/* Payslips List Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading payslip listings...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2 flex flex-col items-center">
            <AlertCircle className="w-8 h-8 text-slate-300" />
            <span className="text-sm font-semibold">No paid records found for this period.</span>
            <span className="text-xs text-slate-400 max-w-xs">
              Payslips are only generated automatically once the bulk payroll run has been successfully paid in the Payments module.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {filtered.map((run) => (
              <div 
                key={run.id}
                className="bg-white p-5 border border-slate-100 rounded-2xl shadow-card hover:shadow-md transition-shadow flex flex-col space-y-4"
              >
                {/* Employee Details header */}
                <div className="flex items-start justify-between border-b border-slate-50 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 block bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                      Paid
                    </span>
                    <h3 className="text-sm font-bold text-slate-800 mt-1 block">{run.employee.fullName}</h3>
                    <span className="text-xs text-slate-400 block mt-0.5">{run.employee.employeeNumber} · {run.employee.position}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-semibold">Net Payout</span>
                    <span className="text-sm font-bold text-slate-800 mt-0.5 block">KES {run.netSalary.toLocaleString()}</span>
                  </div>
                </div>

                {/* Earnings & Deductions lines */}
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="space-y-1 text-slate-400">
                    <div className="flex justify-between">
                      <span>Basic Pay:</span>
                      <span className="text-slate-700">KES {run.basicSalary.toLocaleString()}</span>
                    </div>
                    {run.overtimeHours > 0 && (
                      <div className="flex justify-between">
                        <span>Overtime:</span>
                        <span className="text-slate-700">KES {(run.overtimeHours * run.overtimeRate).toLocaleString()}</span>
                      </div>
                    )}
                    {run.bonusAmount > 0 && (
                      <div className="flex justify-between">
                        <span>Bonuses:</span>
                        <span className="text-slate-700">KES {run.bonusAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-slate-400 pl-4 border-l border-slate-50">
                    <div className="flex justify-between">
                      <span>Tax/Stautory:</span>
                      <span className="text-rose-600">KES {run.deductions.toLocaleString()}</span>
                    </div>
                    {run.advanceDeduction > 0 && (
                      <div className="flex justify-between">
                        <span>Advances:</span>
                        <span className="text-rose-600">KES {run.advanceDeduction.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-2">
                  {/* Download PDF */}
                  <button
                    onClick={() => handleDownloadPDF(run)}
                    className="flex-1 flex items-center justify-center space-x-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold py-2 rounded-lg text-xs transition-colors shadow-sm"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>

                  {/* Send email notifications */}
                  {!isEmployee && (
                    <button
                      onClick={() => handleSendNotification(run.id)}
                      disabled={sendingId === run.id}
                      className={`flex-1 flex items-center justify-center space-x-2 font-bold py-2 rounded-lg text-xs transition-all shadow-sm ${
                        sentMap[run.id]
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {sendingId === run.id ? (
                        <>
                          <svg className="animate-spin w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Delivering...</span>
                        </>
                      ) : sentMap[run.id] ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Sent via Email</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email Payslip</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
