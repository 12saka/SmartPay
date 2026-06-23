import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Wallet, 
  Save, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { authService } from '../services/api';

export default function ProfileView() {
  const currentUser = authService.getCurrentUser() || {
    name: 'Jane Doe',
    email: 'owner@smartpay.com',
    role: 'OWNER',
    branch: { name: 'Nairobi CBD Branch' }
  };

  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: '0711223344',
    location: 'Nairobi HQ',
    emergencyContact: 'Jane Mwangi - 0711111222',
    bankAccount: '0110987654321',
    mpesaNumber: '0711223344',
    currentPassword: '',
    newPassword: '',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess('Profile details successfully updated.');
    }, 1500);
  };

  const profileCompletion = 85; // Mock completion percentage

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">My Profile</h1>
        <p className="text-sm text-slate-500">Manage your personal credentials, contact lists, and linked payroll settlement endpoints</p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-sm font-semibold flex items-center space-x-3 shadow-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar and Completion Progress */}
        <div className="space-y-6">
          <div className="bg-white p-6 border border-slate-200/80 rounded-xl shadow-card flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-emerald-600 text-white flex items-center justify-center text-3xl font-extrabold shadow-md mb-4 border-4 border-slate-100">
              {currentUser.name.charAt(0)}
            </div>
            <h3 className="text-base font-extrabold text-slate-800">{currentUser.name}</h3>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mt-1">
              Role: {currentUser.role}
            </span>
            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
              {currentUser.branch ? currentUser.branch.name : 'SuperMart HQ'}
            </span>

            <div className="w-full mt-6">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-400">Profile Completion</span>
                <span className="text-[var(--brand-green)]">{profileCompletion}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-[var(--brand-green)] h-full" style={{ width: `${profileCompletion}%` }}></div>
              </div>
            </div>
          </div>

          {/* Linked Bank / Mpesa Accounts */}
          <div className="bg-white p-6 border border-slate-200/80 rounded-xl shadow-card">
            <h4 className="text-sm font-extrabold text-slate-800 flex items-center space-x-2 mb-4">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Linked Payment Channels</span>
            </h4>
            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400 font-semibold">M-Pesa Payout Number</span>
                <span className="font-mono font-bold text-slate-800">{formData.mpesaNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Bank Account Number</span>
                <span className="font-mono font-bold text-slate-800">{formData.bankAccount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="lg:col-span-2 bg-white p-6 border border-slate-200/80 rounded-xl shadow-card">
          <form onSubmit={handleSave} className="space-y-5">
            <h3 className="text-base font-extrabold text-slate-800 mb-4 pb-2 border-b border-slate-50">Profile Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full text-sm pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full text-sm pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full text-sm pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Office Location */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Office Location</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full text-sm pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-500 block mb-1">Emergency Contact</label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <h3 className="text-base font-extrabold text-slate-800 mt-6 pt-4 pb-2 border-b border-slate-50 flex items-center space-x-2">
              <Shield className="w-4.5 h-4.5 text-emerald-600" />
              <span>Change Password</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-lg text-sm transition-all shadow-sm btn-hover-scale"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
