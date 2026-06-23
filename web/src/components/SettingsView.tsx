import React, { useState } from 'react';
import { 
  Settings, 
  Building, 
  Percent, 
  ShieldCheck, 
  Bell, 
  Database,
  Save,
  CheckCircle
} from 'lucide-react';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('company');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: 'company', label: 'Company Profile', icon: Building },
    { id: 'payroll', label: 'Payroll Rules', icon: Percent },
    { id: 'permissions', label: 'Roles & Access', icon: ShieldCheck },
    { id: 'notifications', label: 'Alert Settings', icon: Bell }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">Settings Console</h1>
        <p className="text-sm text-slate-500 font-medium">Configure company defaults, statutory deduction rates, and security permissions</p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-sm font-semibold flex items-center space-x-3 shadow-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>System configurations successfully updated and synchronized.</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side: Tabs */}
        <div className="lg:w-64 shrink-0 flex flex-row lg:flex-col gap-2 border-b lg:border-b-0 lg:border-r border-slate-200/60 pb-4 lg:pb-0 lg:pr-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Tab Panel Content */}
        <div className="flex-1 bg-white p-6 border border-slate-200/80 rounded-xl shadow-card">
          <form onSubmit={handleSave} className="space-y-6">
            
            {activeTab === 'company' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 pb-2 border-b border-slate-50">Company Profile Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Company Name</label>
                    <input type="text" defaultValue="SuperMart Retail Chains Ltd" className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Company PIN (KRA)</label>
                    <input type="text" defaultValue="P051293810Z" className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Registered Address</label>
                    <input type="text" defaultValue="Mombasa Road, Nairobi, Kenya" className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Support Email</label>
                    <input type="email" defaultValue="accounts@supermart.co.ke" className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payroll' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 pb-2 border-b border-slate-50">Kenya Statutory Rates defaults</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">SHIF Deduction Rate</label>
                    <div className="relative">
                      <input type="text" defaultValue="2.75" className="w-full text-sm border border-slate-200 rounded-lg p-2 pr-6 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Housing Levy (Employee contribution)</label>
                    <div className="relative">
                      <input type="text" defaultValue="1.50" className="w-full text-sm border border-slate-200 rounded-lg p-2 pr-6 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Housing Levy (Employer co-matching)</label>
                    <div className="relative">
                      <input type="text" defaultValue="1.50" className="w-full text-sm border border-slate-200 rounded-lg p-2 pr-6 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">NSSF Upper Cap (Tier II)</label>
                    <input type="text" defaultValue="KES 1,080" className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 pb-2 border-b border-slate-50">Role Permissions Grid</h3>
                <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="p-3">Feature Area</th>
                        <th className="p-3 text-center">Owner</th>
                        <th className="p-3 text-center">Manager</th>
                        <th className="p-3 text-center">Accountant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      <tr>
                        <td className="p-3">Create / Edit Employees</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">✔ Allowed</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">✔ Allowed</td>
                        <td className="p-3 text-center text-slate-400">Locked</td>
                      </tr>
                      <tr>
                        <td className="p-3">Approve Payroll Roster</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">✔ Allowed</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">✔ Allowed</td>
                        <td className="p-3 text-center text-slate-400">Locked</td>
                      </tr>
                      <tr>
                        <td className="p-3">Execute Bulk M-Pesa Payout</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">✔ Allowed</td>
                        <td className="p-3 text-center text-slate-400">Locked</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">✔ Allowed</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 pb-2 border-b border-slate-50">Notification Rules</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                    <span>Send SMS payout confirmations to employees immediately upon bank clearing</span>
                  </label>
                  <label className="flex items-center space-x-3 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                    <span>Notify company administrators immediately if M-Pesa float balance falls below KES 200,000</span>
                  </label>
                  <label className="flex items-center space-x-3 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                    <span>Enable daily email digests for all manager and approval audit trails</span>
                  </label>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all shadow-sm btn-hover-scale"
              >
                <Save className="w-4 h-4" />
                <span>Save Config</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
