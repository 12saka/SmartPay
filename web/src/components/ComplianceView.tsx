import React from 'react';
import { 
  FileCheck2, 
  Calendar, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  ExternalLink
} from 'lucide-react';

export default function ComplianceView() {
  const complianceData = [
    { deduction: 'PAYE (Income Tax)', agency: 'Kenya Revenue Authority', rate: 'Progressive (10% to 32.5%)', status: 'Submitted', date: '07 Jun 2026', color: 'emerald' },
    { deduction: 'SHIF (Health Insurance)', agency: 'Social Health Authority', rate: '2.75% of Basic Salary', status: 'Pending', date: '09 Jun 2026 (Today)', color: 'amber' },
    { deduction: 'NSSF (Pension Fund)', agency: 'National Social Security Fund', rate: 'Tier I & II statutory caps', status: 'Submitted', date: '08 Jun 2026', color: 'emerald' },
    { deduction: 'Housing Levy', agency: 'State Department of Housing', rate: '1.5% Employee + 1.5% Employer', status: 'Submitted', date: '08 Jun 2026', color: 'emerald' }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">Compliance Center</h1>
        <p className="text-sm text-slate-500">Track and generate pre-formatted statutory deductions matching Kenya Government portals</p>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Status Table */}
        <div className="lg:col-span-2 bg-white p-6 border border-slate-200/80 rounded-xl shadow-card flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Statutory Deductions Roster</h3>
              <span className="text-xs text-slate-400 font-semibold">May 2024 Filings</span>
            </div>

            <div className="divide-y divide-slate-100">
              {complianceData.map((c, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-3.5">
                    <div className={`p-2.5 rounded-xl ${
                      c.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50/50 text-amber-600'
                    }`}>
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-800 block">{c.deduction}</span>
                      <span className="text-xs text-slate-400 block mt-0.5 font-medium">{c.agency} · Rate: {c.rate}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                        c.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {c.status}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1 font-semibold">Filing date: {c.date}</span>
                    </div>
                    <button className="flex items-center space-x-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm transition-colors">
                      <Download className="w-3.5 h-3.5" />
                      <span>ZIP File</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Compliance Calendar & Cheat sheet */}
        <div className="space-y-6">
          {/* Calendar Card */}
          <div className="bg-white p-6 border border-slate-200/80 rounded-xl shadow-card interactive-card">
            <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2 mb-4">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Filing Calendar (KENYA)</span>
            </h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex items-start space-x-2 pb-3 border-b border-slate-50">
                <div className="px-2 py-1 bg-amber-100 text-amber-800 font-bold rounded text-center min-w-10">
                  <span className="block text-[10px] leading-none uppercase">Jun</span>
                  <span className="block text-sm leading-none mt-0.5">09</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">SHIF Due (Today)</span>
                  <span className="text-slate-400 block mt-0.5">Payment must reach SHA portal before midnight.</span>
                </div>
              </div>

              <div className="flex items-start space-x-2 pb-3 border-b border-slate-50">
                <div className="px-2 py-1 bg-rose-100 text-rose-800 font-bold rounded text-center min-w-10">
                  <span className="block text-[10px] leading-none uppercase">Jun</span>
                  <span className="block text-sm leading-none mt-0.5">09</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">PAYE Filing Due</span>
                  <span className="text-slate-400 block mt-0.5">KRA iTax system submission deadline.</span>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <div className="px-2 py-1 bg-slate-100 text-slate-600 font-bold rounded text-center min-w-10">
                  <span className="block text-[10px] leading-none uppercase">Jun</span>
                  <span className="block text-sm leading-none mt-0.5">20</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">Housing Levy Submission</span>
                  <span className="text-slate-400 block mt-0.5">Filing payment slips check with state agent.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="bg-slate-900 p-6 rounded-2xl shadow-card border border-slate-800 text-white relative overflow-hidden">
            <div className="flex items-center space-x-2 mb-3">
              <Info className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
              <h4 className="text-sm font-bold text-slate-100">KRA/SHIF Cheat Sheet</h4>
            </div>
            <div className="space-y-2.5 text-xs text-slate-300 font-medium">
              <p>• **SHIF**: Replaces NHIF. Applied as a flat **2.75%** of the employee's basic monthly salary.</p>
              <p>• **NSSF**: Auto-cap at Tier I KES **360** and Tier II KES **720** (KES 1,080 total contribution matched by employer).</p>
              <p>• **Housing Levy**: **1.5%** deducted from employee's gross, with another **1.5%** co-funded by employer.</p>
            </div>
            <a 
              href="https://itax.kra.go.ke" 
              target="_blank" 
              rel="noreferrer" 
              className="mt-4 flex items-center space-x-1.5 text-emerald-400 hover:text-emerald-300 font-bold text-xs"
            >
              <span>Visit iTax Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
