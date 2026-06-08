import React, { useEffect, useState } from 'react';
import { 
  Calculator, 
  Check, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileCheck2
} from 'lucide-react';
import { payrollService } from '../services/api';

interface PayrollViewProps {
  selectedBranchId: number | null;
  currentUser: any;
}

export default function PayrollView({ selectedBranchId, currentUser }: PayrollViewProps) {
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
  const [month, setMonth] = useState('2026-06');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Inline edit state
  const [editingRunId, setEditingRunId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    overtimeHours: 0,
    overtimeRate: 0,
    bonusAmount: 0,
    penalties: 0
  });

  useEffect(() => {
    loadPayroll();
  }, [month, selectedBranchId]);

  async function loadPayroll() {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await payrollService.getAll({
        month,
        branchId: selectedBranchId || undefined
      });
      setPayrollRuns(data);
    } catch (error: any) {
      console.error('Failed to load payroll:', error);
      setErrorMsg('Failed to load payroll records.');
    } finally {
      setLoading(false);
    }
  }

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setErrorMsg('');
      await payrollService.generateDraft(month, selectedBranchId || undefined);
      loadPayroll();
    } catch (err: any) {
      setErrorMsg(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleEditClick = (run: any) => {
    setEditingRunId(run.id);
    setEditFormData({
      overtimeHours: run.overtimeHours,
      overtimeRate: run.overtimeRate,
      bonusAmount: run.bonusAmount,
      penalties: run.penalties
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSaveEdit = async (id: number) => {
    try {
      setErrorMsg('');
      await payrollService.updateRun(id, editFormData);
      setEditingRunId(null);
      loadPayroll();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save modifications');
    }
  };

  const handleApprovalAction = async (action: 'HR_APPROVE' | 'FINANCE_APPROVE' | 'COMPANY_APPROVE' | 'RESET') => {
    try {
      setErrorMsg('');
      await payrollService.updatePeriodStatus(month, action, selectedBranchId || undefined);
      loadPayroll();
    } catch (err: any) {
      setErrorMsg(err.message || 'Approval action failed');
    }
  };

  // Determine current overall state for the period
  const getPeriodStatus = () => {
    if (payrollRuns.length === 0) return 'NO_DATA';
    
    // Check if any is paid
    if (payrollRuns.some(r => r.status === 'PAID')) return 'PAID';
    
    // Check if all are APPROVED
    if (payrollRuns.every(r => r.status === 'APPROVED')) return 'APPROVED';
    
    // Check if all are FINANCE_APPROVED
    if (payrollRuns.every(r => r.status === 'FINANCE_APPROVED')) return 'FINANCE_APPROVED';
    
    // Check if all are HR_APPROVED
    if (payrollRuns.every(r => r.status === 'HR_APPROVED')) return 'HR_APPROVED';
    
    return 'DRAFT';
  };

  const status = getPeriodStatus();
  
  const totalNet = payrollRuns.reduce((sum, r) => sum + r.netSalary, 0);
  const totalBasic = payrollRuns.reduce((sum, r) => sum + r.basicSalary, 0);
  const totalDeductions = payrollRuns.reduce((sum, r) => sum + r.deductions + r.advanceDeduction + r.penalties, 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Payroll Calculations</h1>
          <p className="text-sm text-slate-500">Generate drafts, approve salary runs, and manage bonuses/taxes</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="text-sm border border-slate-200 bg-white rounded-lg px-3 py-2 outline-none font-semibold text-slate-700"
          />
          {status === 'NO_DATA' && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold px-4 py-2 rounded-lg text-sm shadow-sm transition-colors"
            >
              <Calculator className="w-4 h-4" />
              <span>{generating ? 'Processing...' : 'Generate Draft'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Box */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-sm font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Approval Status Header Widget */}
      {status !== 'NO_DATA' && (
        <div className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl ${
              status === 'PAID' ? 'bg-emerald-100 text-emerald-600' :
              status === 'APPROVED' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-semibold">Workflow Status</span>
              <span className="text-sm font-bold text-slate-800 block mt-0.5">
                {status === 'PAID' && '🎉 Salaries Disbursed & Paid'}
                {status === 'APPROVED' && '✅ Approved by Owner - Ready for Payout'}
                {status === 'FINANCE_APPROVED' && '💼 Finance Approved - Pending Owner Sign-off'}
                {status === 'HR_APPROVED' && '📝 HR Approved - Pending Finance Review'}
                {status === 'DRAFT' && '✏️ Draft Reviewing - Pending HR Approval'}
              </span>
            </div>
          </div>

          {/* Action buttons based on Role */}
          <div className="flex items-center space-x-2.5">
            {status === 'DRAFT' && (
              <button 
                onClick={() => handleApprovalAction('HR_APPROVE')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-3 rounded-lg transition-colors shadow-sm"
              >
                Approve as HR
              </button>
            )}
            {status === 'HR_APPROVED' && (
              <button 
                onClick={() => handleApprovalAction('FINANCE_APPROVE')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-3 rounded-lg transition-colors shadow-sm"
              >
                Approve as Finance
              </button>
            )}
            {status === 'FINANCE_APPROVED' && (
              <button 
                onClick={() => handleApprovalAction('COMPANY_APPROVE')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-3 rounded-lg transition-colors shadow-sm"
              >
                Give Owner Approval
              </button>
            )}
            {status !== 'PAID' && (
              <button 
                onClick={() => handleApprovalAction('RESET')}
                className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 font-semibold text-xs py-2 px-3 rounded-lg transition-colors"
              >
                Reset Draft
              </button>
            )}
          </div>
        </div>
      )}

      {/* Calculations table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading payroll entries...</div>
          ) : payrollRuns.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No payroll records found for this period. Click "Generate Draft" to compute entries.
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Basic Pay</th>
                  <th className="px-6 py-4">Overtime (Hrs × Rate)</th>
                  <th className="px-6 py-4">Bonus</th>
                  <th className="px-6 py-4">Taxes & Statutory</th>
                  <th className="px-6 py-4">Loan Advance</th>
                  <th className="px-6 py-4">Penalties</th>
                  <th className="px-6 py-4 font-bold">Net Salary</th>
                  {status === 'DRAFT' && <th className="px-6 py-4 text-center">Edit</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {payrollRuns.map((run) => {
                  const isEditing = editingRunId === run.id;
                  return (
                    <tr key={run.id} className="hover:bg-slate-50/50 text-slate-700">
                      {/* Name / ID */}
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-bold text-slate-900 block">{run.employee.fullName}</span>
                          <span className="text-xs text-slate-400 block mt-0.5">{run.employee.employeeNumber}</span>
                        </div>
                      </td>

                      {/* Basic */}
                      <td className="px-6 py-4 text-slate-900">
                        KES {run.basicSalary.toLocaleString()}
                      </td>

                      {/* Overtime */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="flex items-center space-x-1.5 max-w-xs">
                            <input
                              type="number"
                              name="overtimeHours"
                              value={editFormData.overtimeHours}
                              onChange={handleEditChange}
                              className="w-12 border border-slate-200 rounded p-1 text-xs outline-none"
                              placeholder="Hrs"
                            />
                            <span className="text-slate-400 text-xs">×</span>
                            <input
                              type="number"
                              name="overtimeRate"
                              value={editFormData.overtimeRate}
                              onChange={handleEditChange}
                              className="w-16 border border-slate-200 rounded p-1 text-xs outline-none"
                              placeholder="Rate"
                            />
                          </div>
                        ) : (
                          <div>
                            <span className="text-slate-800 block">
                              KES {(run.overtimeHours * run.overtimeRate).toLocaleString()}
                            </span>
                            {run.overtimeHours > 0 && (
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                {run.overtimeHours} hrs @ {run.overtimeRate}/hr
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Bonus */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            name="bonusAmount"
                            value={editFormData.bonusAmount}
                            onChange={handleEditChange}
                            className="w-16 border border-slate-200 rounded p-1 text-xs outline-none"
                            placeholder="Bonus"
                          />
                        ) : (
                          <span className="text-slate-800">KES {run.bonusAmount.toLocaleString()}</span>
                        )}
                      </td>

                      {/* Statutory deductions */}
                      <td className="px-6 py-4 text-rose-600">
                        - KES {run.deductions.toLocaleString()}
                      </td>

                      {/* Advance deduction */}
                      <td className="px-6 py-4 text-rose-600">
                        {run.advanceDeduction > 0 ? `- KES ${run.advanceDeduction.toLocaleString()}` : '—'}
                      </td>

                      {/* Penalties */}
                      <td className="px-6 py-4 text-rose-600">
                        {isEditing ? (
                          <input
                            type="number"
                            name="penalties"
                            value={editFormData.penalties}
                            onChange={handleEditChange}
                            className="w-16 border border-slate-200 rounded p-1 text-xs outline-none"
                            placeholder="Penalty"
                          />
                        ) : (
                          run.penalties > 0 ? `- KES ${run.penalties.toLocaleString()}` : '—'
                        )}
                      </td>

                      {/* Net salary */}
                      <td className="px-6 py-4 font-bold text-slate-900">
                        KES {run.netSalary.toLocaleString()}
                      </td>

                      {/* Edit control */}
                      {status === 'DRAFT' && (
                        <td className="px-6 py-4 text-center">
                          {isEditing ? (
                            <button
                              onClick={() => handleSaveEdit(run.id)}
                              className="p-1.5 bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-lg transition-colors"
                              title="Save Changes"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEditClick(run)}
                              className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded transition-colors"
                              title="Edit Payroll Row"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Table summary footer */}
        {payrollRuns.length > 0 && (
          <div className="p-5 bg-slate-50 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 font-bold text-slate-800 text-sm">
            <div>
              <span className="text-xs text-slate-400 block font-semibold">Total Basic Salaries</span>
              <span className="text-base font-bold text-slate-800 block mt-1">KES {totalBasic.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-semibold">Total Deductions</span>
              <span className="text-base font-bold text-rose-600 block mt-1">- KES {totalDeductions.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-semibold">Total Net Disbursements</span>
              <span className="text-lg font-bold text-emerald-600 block mt-1">KES {totalNet.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
