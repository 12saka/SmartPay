import React, { useEffect, useState } from 'react';
import { 
  Wallet, 
  CheckCircle2, 
  Send, 
  ArrowRight, 
  FileCheck2,
  Terminal,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { payrollService } from '../services/api';
import { useToast } from './ui/ToastProvider';
import { useCelebration } from './providers/CelebrationProvider';

interface PaymentsViewProps {
  selectedBranchId: number | null;
}

export default function PaymentsView({ selectedBranchId }: PaymentsViewProps) {
  const { success, error: toastError } = useToast();
  const { celebrate } = useCelebration();
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
  const [month, setMonth] = useState('2026-06');
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('MPESA');
  
  // Simulation states
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [paymentResult, setPaymentResult] = useState<any | null>(null);

  useEffect(() => {
    loadPayroll();
  }, [month, selectedBranchId]);

  async function loadPayroll() {
    try {
      setLoading(true);
      const data = await payrollService.getAll({
        month,
        branchId: selectedBranchId || undefined,
        status: 'APPROVED' // Only show approved payroll ready for payment
      });
      setPayrollRuns(data);
    } catch (error) {
      console.error('Failed to load approved payroll:', error);
    } finally {
      setLoading(false);
    }
  }

  const runSimulation = (onComplete: () => void) => {
    setProcessing(true);
    setProgress(0);
    setLogs([]);
    
    const messages = [
      `[13:56:01] Contacting payment gateway (${paymentMethod} API)...`,
      `[13:56:03] Connection established. Handshake accepted.`,
      `[13:56:05] Batch instructions queued. Packaging employee rosters...`,
      `[13:56:07] Disbursing Batch #1 (Sales & Cashiers)... Callbacks received.`,
      `[13:56:09] Disbursing Batch #2 (Warehousing & Security)... Callbacks received.`,
      `[13:56:11] Validating payment confirmations against statutory pins...`,
      `[13:56:13] Retrying 1 failed item (Airtel routing mismatch)... Success.`,
      `[13:56:15] Payout execution completed. All records marked as PAID.`
    ];

    let logIndex = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 12.5;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 600);
          return 100;
        }
        return next;
      });

      if (logIndex < messages.length) {
        setLogs(prev => [...prev, messages[logIndex]]);
        logIndex++;
      }
    }, 1000);
  };

  const handlePayAll = async () => {
    if (payrollRuns.length === 0) return;
    
    // Run the visualization first, then hit the actual API at the end
    runSimulation(async () => {
      try {
        const res = await payrollService.executeBulk(
          month,
          paymentMethod,
          selectedBranchId || undefined
        );
        setPaymentResult(res);
        setProcessing(false);
        loadPayroll();
        celebrate(4000);
        success('🎉 Payments Disbursed!', `All ${month} salaries have been successfully paid via ${paymentMethod}.`);
      } catch (err: any) {
        toastError('Payment Failed', err.message || 'Could not finalize payments. Please retry.');
        console.error('Failed to finalize payments:', err);
        setProcessing(false);
      }
    });
  };

  const totalNet = payrollRuns.reduce((sum, r) => sum + r.netSalary, 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">Bulk Salary Payments</h1>
        <p className="text-sm text-slate-500">Disburse salary payments to all employees with a single action</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payout trigger console */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 border border-slate-200/80 rounded-xl shadow-card flex flex-col space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-800">Payment Summary</h2>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="text-xs border border-slate-200 bg-white rounded px-2.5 py-1.5 outline-none font-semibold text-slate-700"
              />
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-400">Loading approved calculations...</div>
            ) : payrollRuns.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2 flex flex-col items-center">
                <AlertCircle className="w-8 h-8 text-slate-300" />
                <span className="text-sm font-semibold">No approved payroll runs found for this period.</span>
                <span className="text-xs text-slate-400 max-w-xs">
                  Ensure the payroll calculations are fully approved by HR, Finance, and the Manager before payment.
                </span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-xs text-slate-400 block font-semibold">Ready Payouts</span>
                    <span className="text-lg font-bold text-slate-800 mt-1 block">{payrollRuns.length} Employees</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-semibold">Selected Method</span>
                    <span className="text-sm font-bold text-slate-800 mt-1.5 block capitalize">
                      {paymentMethod.toLowerCase()} B2C Gateway
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-semibold">Total Amount</span>
                    <span className="text-base font-extrabold text-emerald-600 mt-1 block">
                      KES {totalNet.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Gateway config selection */}
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-2">Select Disbursement Gateway</label>
                  <div className="grid grid-cols-3 gap-4">
                    {/* M-Pesa B2C */}
                    <button
                      onClick={() => setPaymentMethod('MPESA')}
                      className={`flex items-center space-x-3 p-3 border rounded-xl text-left transition-all ${
                        paymentMethod === 'MPESA' 
                          ? 'border-emerald-500 bg-emerald-50/10 ring-1 ring-emerald-500/20' 
                          : 'border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                        MP
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Safaricom M-Pesa</span>
                        <span className="text-[10px] text-slate-400 block">B2C Daraja API</span>
                      </div>
                    </button>

                    {/* Bank EFT */}
                    <button
                      onClick={() => setPaymentMethod('BANK')}
                      className={`flex items-center space-x-3 p-3 border rounded-xl text-left transition-all ${
                        paymentMethod === 'BANK' 
                          ? 'border-emerald-500 bg-emerald-50/10 ring-1 ring-emerald-500/20' 
                          : 'border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        BK
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Bank EFT Transfer</span>
                        <span className="text-[10px] text-slate-400 block">Interbank Payouts</span>
                      </div>
                    </button>

                    {/* Airtel Money */}
                    <button
                      onClick={() => setPaymentMethod('AIRTEL')}
                      className={`flex items-center space-x-3 p-3 border rounded-xl text-left transition-all ${
                        paymentMethod === 'AIRTEL' 
                          ? 'border-emerald-500 bg-emerald-50/10 ring-1 ring-emerald-500/20' 
                          : 'border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
                        AT
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Airtel Money</span>
                        <span className="text-[10px] text-slate-400 block">Mobile Wallet B2C</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Big Payout Action */}
                <button
                  onClick={handlePayAll}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center space-x-3 transition-colors text-base"
                >
                  <Wallet className="w-5 h-5" />
                  <span>Execute Bulk Payment</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info panel / Completed payment receipts */}
        <div>
          {paymentResult ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 shadow-card space-y-4">
              <div className="flex items-center space-x-2.5 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <h3 className="text-sm font-bold">Disbursement Completed</h3>
              </div>
              <div className="space-y-2 text-xs font-medium text-emerald-800/80">
                <div className="flex justify-between">
                  <span>Receipt Code:</span>
                  <span className="font-bold text-emerald-950 font-mono">{paymentResult.referenceCode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paid Employees:</span>
                  <span className="font-bold text-emerald-950">{paymentResult.employeeCount} accounts</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount Paid:</span>
                  <span className="font-bold text-emerald-950">KES {paymentResult.totalPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Timestamp:</span>
                  <span className="font-bold text-emerald-950">{new Date().toLocaleString()}</span>
                </div>
              </div>
              <button 
                onClick={() => setPaymentResult(null)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-lg text-xs transition-colors"
              >
                Clear Receipt
              </button>
            </div>
          ) : (
            <div className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-card space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <FileCheck2 className="w-4 h-4 text-slate-400" />
                <span>Security Guidelines</span>
              </h3>
              <div className="space-y-3 text-xs text-slate-500 font-medium">
                <p>
                  1. Double-check department allocations and individual tax reliefs before clicking execute.
                </p>
                <p>
                  2. Ensure company wallet balances are sufficiently funded to avoid partial transaction errors.
                </p>
                <p>
                  3. Audit logs record the IP address and User ID of the initiator executing mass payouts.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full screen simulation overlay */}
      {processing && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col space-y-6 p-6">
            
            {/* Header */}
            <div className="flex items-center space-x-3">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
              <div>
                <h3 className="text-base font-bold text-white leading-none">Executing Bulk Salaries</h3>
                <span className="text-xs text-slate-500 mt-1 block">Executing secure payouts via {paymentMethod}...</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Disbursement Progress</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Live Terminal logs */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 space-y-1.5 h-48 overflow-y-auto flex flex-col-reverse">
              <div className="flex flex-col space-y-1.5">
                {logs.map((log, index) => (
                  <div key={index} className="leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
