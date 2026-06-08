import React, { useEffect, useState } from 'react';
import { 
  HandCoins, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Users
} from 'lucide-react';
import { advanceService, employeeService } from '../services/api';

interface AdvancesViewProps {
  selectedBranchId: number | null;
}

export default function AdvancesView({ selectedBranchId }: AdvancesViewProps) {
  const [advances, setAdvances] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Request Form state
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    amount: '',
    repaymentPeriod: '1'
  });
  
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedBranchId]);

  async function loadData() {
    try {
      setLoading(true);
      const [advList, empList] = await Promise.all([
        advanceService.getAll(),
        employeeService.getAll({ branchId: selectedBranchId || undefined })
      ]);
      // Filter advances locally by branch if selected
      const filteredAdv = selectedBranchId 
        ? advList.filter(a => a.employee.branchId === selectedBranchId)
        : advList;
      setAdvances(filteredAdv);
      setEmployees(empList);
    } catch (error) {
      console.error('Failed to load advances data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenRequest = () => {
    setFormData({
      employeeId: employees.length > 0 ? employees[0].id.toString() : '',
      amount: '',
      repaymentPeriod: '1'
    });
    setErrorMsg('');
    setIsRequestOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMsg('');
      if (!formData.employeeId || !formData.amount) {
        setErrorMsg('Please select employee and insert amount.');
        return;
      }
      await advanceService.request({
        employeeId: parseInt(formData.employeeId),
        amount: parseFloat(formData.amount),
        repaymentPeriod: parseInt(formData.repaymentPeriod)
      });
      setIsRequestOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit loan request');
    }
  };

  const handleApprove = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      setErrorMsg('');
      await advanceService.approve(id, status);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Approval action failed');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Salary Advances</h1>
          <p className="text-sm text-slate-500">Approve loan requests and track employee repayment balances</p>
        </div>
        <button
          onClick={handleOpenRequest}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Advance</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-sm font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Roster list */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading requests...</div>
          ) : advances.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No salary advance applications found.
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Request Date</th>
                  <th className="px-6 py-4">Requested Amount</th>
                  <th className="px-6 py-4">Repayment (Months)</th>
                  <th className="px-6 py-4">Deducted / Outstanding</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {advances.map((adv) => {
                  const outstanding = adv.amount - adv.deductedAmount;
                  return (
                    <tr key={adv.id} className="hover:bg-slate-50/50 text-slate-700">
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-bold text-slate-900 block">{adv.employee.fullName}</span>
                          <span className="text-xs text-slate-400 block mt-0.5">{adv.employee.employeeNumber}</span>
                        </div>
                      </td>

                      {/* Request Date */}
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">
                        {adv.requestDate}
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 font-bold text-slate-900">
                        KES {adv.amount.toLocaleString()}
                      </td>

                      {/* Period */}
                      <td className="px-6 py-4 text-slate-800">
                        {adv.repaymentPeriod} month{adv.repaymentPeriod > 1 ? 's' : ''}
                      </td>

                      {/* Deducted / Outstanding */}
                      <td className="px-6 py-4">
                        {adv.status === 'PENDING' || adv.status === 'REJECTED' ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <div>
                            <span className="text-emerald-600 block">Deducted: KES {adv.deductedAmount.toLocaleString()}</span>
                            <span className="text-xs text-rose-500 block mt-0.5">Left: KES {outstanding.toLocaleString()}</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          adv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                          adv.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' : 
                          adv.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {adv.status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-4 text-center">
                        {adv.status === 'PENDING' ? (
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleApprove(adv.id, 'APPROVED')}
                              className="p-1 hover:bg-emerald-50 text-emerald-500 hover:text-emerald-700 rounded transition-colors"
                              title="Approve loan"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApprove(adv.id, 'REJECTED')}
                              className="p-1 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded transition-colors"
                              title="Reject loan"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold uppercase">Closed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Apply Loan Modal */}
      {isRequestOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-slate-200 animate-fade-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Apply Salary Advance</h3>
              <button onClick={() => setIsRequestOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Employee */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Select Employee</label>
                <select
                  name="employeeId"
                  required
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">-- Select employee --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.fullName} ({e.employeeNumber})</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Advance Amount (KES)</label>
                <input
                  type="number"
                  name="amount"
                  required
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g., 10000"
                />
              </div>

              {/* Repayment period */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Repayment Schedule (Months)</label>
                <select
                  name="repaymentPeriod"
                  value={formData.repaymentPeriod}
                  onChange={handleInputChange}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="1">1 Month (Deduct next payroll)</option>
                  <option value="2">2 Months (Equal installments)</option>
                  <option value="3">3 Months (Equal installments)</option>
                  <option value="4">4 Months (Equal installments)</option>
                  <option value="6">6 Months (Equal installments)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsRequestOpen(false)}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 font-semibold rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
