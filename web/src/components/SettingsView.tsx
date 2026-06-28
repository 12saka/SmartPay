import React, { useState } from 'react';
import { 
  Settings, 
  Building, 
  Percent, 
  ShieldCheck, 
  Bell, 
  Save,
  CheckCircle,
  MapPin,
  Calendar,
  Globe
} from 'lucide-react';

interface SettingsViewProps {
  currentUser?: any;
}

export default function SettingsView({ currentUser }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState('company');
  const [saved, setSaved] = useState(false);

  const isEmployee = currentUser?.role === 'EMPLOYEE';
  const isAccountant = currentUser?.role === 'ACCOUNTANT';
  const isReadOnly = isEmployee || isAccountant;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: 'company', label: 'Company Profile', icon: Building },
    { id: 'payroll', label: 'Payroll Rules', icon: Percent, hidden: isEmployee },
    { id: 'permissions', label: 'Roles & Access', icon: ShieldCheck, hidden: isEmployee },
    { id: 'notifications', label: 'Alert Settings', icon: Bell, hidden: isEmployee }
  ].filter(t => !t.hidden);

  const branchName = currentUser?.branch?.name || 'Nairobi HQ';
  const branchLocation = currentUser?.branch?.location || 'Mombasa Road, Nairobi, Kenya';

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">
          {isEmployee ? 'Branch & Organization Details' : 'Settings Console'}
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          {isEmployee 
            ? 'Review the parameters and details of your assigned company branch' 
            : 'Configure company defaults, statutory deduction rates, and security permissions'}
        </p>
      </div>

      {isAccountant && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2 animate-fade-in flex items-start space-x-3 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="flex-1 text-xs">
            <h3 className="font-bold text-blue-900">Accountant Access & Privileges</h3>
            <p className="text-blue-700 leading-relaxed mt-1">
              You are logged in with Accountant privileges. You have access to review Company Details, Statutory Rates (SHIF, Housing Levy, NSSF), and Roles & Access. Modifying these configurations is restricted to Managers and Owners.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-[10px] font-bold text-blue-800">
              <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span> View Settings: Allowed</span>
              <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span> Verify Rates: Allowed</span>
              <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span> Edit & Save Config: Locked (Read Only)</span>
            </div>
          </div>
        </div>
      )}

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-sm font-semibold flex items-center space-x-3 shadow-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>System configurations successfully updated and synchronized.</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side: Tabs */}
        {tabs.length > 1 && (
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
        )}

        {/* Right Side: Tab Panel Content */}
        <div className="flex-1 bg-white p-6 border border-slate-200/80 rounded-xl shadow-card">
          <form onSubmit={handleSave} className="space-y-6">
            
            {activeTab === 'company' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 pb-2 border-b border-slate-50">
                  {isEmployee ? 'Assigned Branch Information' : 'Company Profile Details'}
                </h3>
                
                {isEmployee ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mt-4">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Organization</span>
                      <div className="flex items-center space-x-2 text-slate-700 font-extrabold">
                        <Building className="w-4 h-4 text-emerald-600" />
                        <span>SuperMart Retail Chains Ltd</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">HQ PIN: P051293810Z</span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Assigned Branch</span>
                      <div className="flex items-center space-x-2 text-slate-700 font-extrabold">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span>{branchName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">{branchLocation}</span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Operating Days</span>
                      <div className="flex items-center space-x-2 text-slate-700 font-extrabold">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span>Monday - Friday</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">Timezone: Africa/Nairobi</span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Currency & Settlement</span>
                      <div className="flex items-center space-x-2 text-slate-700 font-extrabold">
                        <Globe className="w-4 h-4 text-emerald-600" />
                        <span>KES (Kenya Shilling)</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">Payout Channel: M-Pesa / Bank Transfer</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Company Name</label>
                      <input type="text" disabled={isReadOnly} defaultValue="SuperMart Retail Chains Ltd" className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-700 disabled:bg-slate-50 disabled:text-slate-500" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Company PIN (KRA)</label>
                      <input type="text" disabled={isReadOnly} defaultValue="P051293810Z" className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-700 disabled:bg-slate-50 disabled:text-slate-500" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Registered Address</label>
                      <input type="text" disabled={isReadOnly} defaultValue="Mombasa Road, Nairobi, Kenya" className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-700 disabled:bg-slate-50 disabled:text-slate-500" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Support Email</label>
                      <input type="email" disabled={isReadOnly} defaultValue="accounts@supermart.co.ke" className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-700 disabled:bg-slate-50 disabled:text-slate-500" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isEmployee && activeTab === 'payroll' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 pb-2 border-b border-slate-50">Kenya Statutory Rates defaults</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">SHIF Deduction Rate</label>
                    <div className="relative">
                      <input type="text" disabled={isReadOnly} defaultValue="2.75" className="w-full text-sm border border-slate-200 rounded-lg p-2 pr-6 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-700 disabled:bg-slate-50 disabled:text-slate-500" />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Housing Levy (Employee contribution)</label>
                    <div className="relative">
                      <input type="text" disabled={isReadOnly} defaultValue="1.50" className="w-full text-sm border border-slate-200 rounded-lg p-2 pr-6 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-700 disabled:bg-slate-50 disabled:text-slate-500" />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Housing Levy (Employer co-matching)</label>
                    <div className="relative">
                      <input type="text" disabled={isReadOnly} defaultValue="1.50" className="w-full text-sm border border-slate-200 rounded-lg p-2 pr-6 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-700 disabled:bg-slate-50 disabled:text-slate-500" />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">NSSF Upper Cap (Tier II)</label>
                    <input type="text" disabled={isReadOnly} defaultValue="KES 1,080" className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-700 disabled:bg-slate-50 disabled:text-slate-500" />
                  </div>
                </div>
              </div>
            )}

            {!isEmployee && activeTab === 'permissions' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 pb-2 border-b border-slate-50">Role Permissions Grid</h3>
                <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="p-3">Feature Area</th>
                        <th className="p-3 text-center">Manager</th>
                        <th className="p-3 text-center">Accountant</th>
                        <th className="p-3 text-center">Employee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      <tr>
                        <td className="p-3">Create / Edit Employees</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">✔ Allowed</td>
                        <td className="p-3 text-center text-slate-400">Locked</td>
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
                        <td className="p-3 text-center text-emerald-600 font-bold">✔ Allowed</td>
                        <td className="p-3 text-center text-slate-400">Locked</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!isEmployee && activeTab === 'notifications' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 pb-2 border-b border-slate-50">Notification Rules</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input type="checkbox" disabled={isReadOnly} defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 disabled:opacity-50" />
                    <span>Send SMS payout confirmations to employees immediately upon bank clearing</span>
                  </label>
                  <label className="flex items-center space-x-3 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input type="checkbox" disabled={isReadOnly} defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 disabled:opacity-50" />
                    <span>Notify company administrators immediately if M-Pesa float balance falls below KES 200,000</span>
                  </label>
                  <label className="flex items-center space-x-3 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input type="checkbox" disabled={isReadOnly} className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 disabled:opacity-50" />
                    <span>Enable daily email digests for all manager and approval audit trails</span>
                  </label>
                </div>
              </div>
            )}

            {!isReadOnly && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all shadow-sm btn-hover-scale"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Config</span>
                </button>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}
