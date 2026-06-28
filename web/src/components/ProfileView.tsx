import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Wallet, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  FileText,
  Camera,
  History,
  Lock,
  Briefcase,
  Calendar,
  CreditCard
} from 'lucide-react';
import { authService } from '../services/api';
import { useToast } from '@/components/ui/ToastProvider';

interface ProfileViewProps {
  currentUser?: any;
}

export default function ProfileView({ currentUser: propCurrentUser }: ProfileViewProps) {
  const { success: toastSuccess, error: toastError } = useToast();
  
  const currentUser = propCurrentUser || authService.getCurrentUser() || {
    id: 1,
    name: 'John Miller',
    email: 'manager@smartpay.com',
    role: 'MANAGER',
    branch: { name: 'Nairobi HQ' }
  };

  const [firstName, lastName] = (() => {
    const parts = (currentUser.name || 'John Miller').split(' ');
    const first = parts[0] || 'John';
    const last = parts.slice(1).join(' ') || 'Miller';
    return [first, last];
  })();

  // Edit Mode state
  const [isFormEditable, setIsFormEditable] = useState(false);

  // Retrieve stored image if exists in localStorage
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          return parsed.profileImage || null;
        } catch (e) {
          return null;
        }
      }
    }
    return currentUser.profileImage || null;
  });

  const [formData, setFormData] = useState({
    firstName: firstName,
    lastName: lastName,
    email: currentUser.email,
    phone: '0711223344',
    location: currentUser.branch?.name || 'Nairobi HQ',
    nationalId: '12345678',
    dob: '1992-08-15',
    emergencyContact: 'Jane Mwangi - 0711111222',
    bankAccount: '0110987654321',
    mpesaNumber: '0711223344',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Live Password validations
  const passLengthVal = formData.newPassword.length >= 8;
  const passNumberVal = /\d/.test(formData.newPassword);
  const passUpperVal = /[A-Z]/.test(formData.newPassword);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isFormEditable) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toastError('Image Too Large', 'Please select an image file under 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProfileImage(base64String);

      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            parsed.profileImage = base64String;
            localStorage.setItem('user', JSON.stringify(parsed));
            toastSuccess('Success', 'Profile image updated successfully.');
            setTimeout(() => {
              window.location.reload();
            }, 500);
          } catch (err) {
            console.error("Failed to save image", err);
          }
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormEditable) return;
    setSuccessMsg('');
    setErrorMsg('');

    // Check pass match if typing new one
    if (formData.newPassword) {
      if (!passLengthVal || !passNumberVal || !passUpperVal) {
        setErrorMsg('New password does not meet requirements.');
        toastError('Form Error', 'Password strength criteria not met.');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setErrorMsg('New passwords do not match.');
        toastError('Form Error', 'Passwords do not match.');
        return;
      }
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccessMsg('Profile details successfully updated.');
      toastSuccess('Profile Updated', 'Your profile details have been saved.');
      setIsFormEditable(false);
      
      // Update session data
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            parsed.name = `${formData.firstName} ${formData.lastName}`.trim();
            parsed.email = formData.email;
            localStorage.setItem('user', JSON.stringify(parsed));
            setTimeout(() => {
              window.location.reload();
            }, 800);
          } catch (err) {
            console.error("Failed to update user session details", err);
          }
        }
      }
    }, 1200);
  };

  const [idModal, setIdModal] = useState<'front' | 'back' | null>(null);

  const profileCompletion = 90;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in select-none">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">My Profile</h1>
          <p className="text-sm text-slate-500">Manage your personal credentials, contact lists, and linked payroll settlement endpoints</p>
        </div>
        <button 
          onClick={() => {
            toastSuccess('Activity Feed', 'Showing recent security events log.');
          }}
          type="button"
          className="flex items-center space-x-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-lg text-sm shadow-sm transition-all btn-hover-scale cursor-pointer self-start sm:self-auto"
        >
          <History className="w-4.5 h-4.5 text-slate-400" />
          <span>View Activity</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-sm font-semibold flex items-center space-x-3 shadow-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-sm font-semibold flex items-center space-x-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Circular avatar and completeness */}
          <div className="bg-white p-6 border border-slate-200/80 rounded-xl shadow-card flex flex-col items-center text-center">
            <div className="relative mb-4 group/avatar">
              <div className="w-24 h-24 rounded-full bg-emerald-600 text-white flex items-center justify-center text-3xl font-extrabold shadow-md border-4 border-slate-100 overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.name.charAt(0).toUpperCase()
                )}
              </div>
              {isFormEditable && (
                <label className="absolute bottom-0 right-0 bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-full border-2 border-white shadow-md cursor-pointer transition-all hover:scale-105">
                  <Camera className="w-3.5 h-3.5" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                </label>
              )}
            </div>
            
            <h3 className="text-base font-extrabold text-slate-800">{formData.firstName} {formData.lastName}</h3>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mt-1">
              Role: {currentUser.role}
            </span>
            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
              {formData.location}
            </span>

            <div className="w-full mt-6">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-400">Profile Completion</span>
                <span className="text-[var(--brand-green)]">{profileCompletion}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-[var(--brand-green)] h-full" style={{ width: `${profileCompletion}%` }}></div>
              </div>
              
              <button 
                type="button"
                onClick={() => {
                  toastSuccess('Verification Checked', 'All required documents are present and validated.');
                }}
                className="mt-5 w-full flex items-center justify-center space-x-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold py-2 px-3 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <span className="text-emerald-600">☆</span>
                <span>Complete Profile</span>
              </button>
            </div>
          </div>

          {/* Linked Payment Channels */}
          <div className="bg-white p-6 border border-slate-200/80 rounded-xl shadow-card">
            <h4 className="text-sm font-extrabold text-slate-800 flex items-center space-x-2 mb-4">
              <Wallet className="w-4.5 h-4.5 text-emerald-600" />
              <span>Linked Payment Channels</span>
            </h4>
            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-semibold">M-Pesa Payout Number</span>
                <span className="font-mono font-bold text-slate-800">{formData.mpesaNumber}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-400 font-semibold">Bank Account Number</span>
                <span className="font-mono font-bold text-slate-800">{formData.bankAccount}</span>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => toastSuccess('Manage Channels', 'Directing to payment settings...')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center space-x-1 hover:underline cursor-pointer"
              >
                <span>Manage Channels</span>
                <span>↗</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl shadow-card flex flex-col">
          {/* Header Row */}
          <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <User className="w-4.5 h-4.5 text-slate-500" />
              <span>Profile Settings</span>
            </h3>
            <button 
              type="button"
              onClick={() => {
                setIsFormEditable(!isFormEditable);
                if (!isFormEditable) {
                  toastSuccess('Edit Mode Active', 'Profile form is now fully editable.');
                } else {
                  toastSuccess('Edit Mode Disabled', 'Form changes discarded.');
                }
              }}
              className={`flex items-center space-x-1.5 border ${
                isFormEditable 
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70' 
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              } font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm transition-all cursor-pointer`}
            >
              <span>✏️</span>
              <span>{isFormEditable ? 'Locked' : 'Edit'}</span>
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            {/* Split Names and Role */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* First Name */}
              <div className="md:col-span-1">
                <label className="text-xs font-semibold text-slate-500 block mb-1">First Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isFormEditable}
                    className="w-full text-sm pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium text-slate-700 disabled:bg-slate-50/50 disabled:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="md:col-span-1">
                <label className="text-xs font-semibold text-slate-500 block mb-1">Last Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isFormEditable}
                    className="w-full text-sm pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium text-slate-700 disabled:bg-slate-50/50 disabled:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Role Display */}
              <div className="md:col-span-1">
                <label className="text-xs font-semibold text-slate-500 block mb-1">Role</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Briefcase className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={currentUser.role}
                    disabled
                    className="w-full text-sm pl-9 pr-4 py-2 border border-slate-100 bg-slate-50/50 rounded-lg font-medium text-slate-400 cursor-not-allowed capitalize"
                  />
                </div>
              </div>
            </div>

            {/* ID Number and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">National ID Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <CreditCard className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleInputChange}
                    disabled={!isFormEditable}
                    className="w-full text-sm pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium text-slate-700 disabled:bg-slate-50/50 disabled:text-slate-400"
                    required
                  />
                </div>
              </div>

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
                    disabled={!isFormEditable}
                    className="w-full text-sm pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium text-slate-700 disabled:bg-slate-50/50 disabled:text-slate-400"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Phone Number and Office Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    disabled={!isFormEditable}
                    className="w-full text-sm pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium text-slate-700 disabled:bg-slate-50/50 disabled:text-slate-400"
                  />
                </div>
              </div>

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
                    disabled={!isFormEditable}
                    className="w-full text-sm pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium text-slate-700 disabled:bg-slate-50/50 disabled:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Date of Birth (DOB) Field */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Date of Birth (DOB)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    disabled={!isFormEditable}
                    className="w-full text-sm pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium text-slate-700 cursor-pointer disabled:bg-slate-50/50 disabled:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* National ID Upload Placeholders */}
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-2">National ID Upload</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border border-slate-150 rounded-xl bg-slate-50/50">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-700">ID Front</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIdModal('front')}
                    className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm cursor-pointer transition-colors"
                  >
                    View Front
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-slate-150 rounded-xl bg-slate-50/50">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-700">ID Back</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIdModal('back')}
                    className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm cursor-pointer transition-colors"
                  >
                    View Back
                  </button>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Emergency Contact</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <User className="w-4.5 h-4.5 text-slate-400" />
                </span>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  disabled={!isFormEditable}
                  className="w-full text-sm pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium text-slate-700 disabled:bg-slate-50/50 disabled:text-slate-400"
                />
              </div>
            </div>

            {/* Change Password Block */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Lock className="w-4.5 h-4.5 text-emerald-600" />
                <span>Change Password</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Current Password */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      disabled={!isFormEditable}
                      className="w-full text-sm border border-slate-200 rounded-lg p-2.5 pr-10 focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium text-slate-700 disabled:bg-slate-50/50 disabled:text-slate-400"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      disabled={!isFormEditable}
                      className="w-full text-sm border border-slate-200 rounded-lg p-2.5 pr-10 focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium text-slate-700 disabled:bg-slate-50/50 disabled:text-slate-400"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      disabled={!isFormEditable}
                      className="w-full text-sm border border-slate-200 rounded-lg p-2.5 pr-10 focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium text-slate-700 disabled:bg-slate-50/50 disabled:text-slate-400"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password strength checklist display */}
              {formData.newPassword && (
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-xs select-none">
                  <div className={`flex items-center space-x-1.5 font-bold ${passLengthVal ? 'text-emerald-600' : 'text-slate-450'}`}>
                    <span>{passLengthVal ? '✓' : '○'}</span>
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 font-bold ${passNumberVal ? 'text-emerald-600' : 'text-slate-450'}`}>
                    <span>{passNumberVal ? '✓' : '○'}</span>
                    <span>1 number</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 font-bold ${passUpperVal ? 'text-emerald-600' : 'text-slate-450'}`}>
                    <span>{passUpperVal ? '✓' : '○'}</span>
                    <span>1 uppercase</span>
                  </div>
                </div>
              )}
            </div>

            {/* Cancel and Save Buttons - Only visible when form is editable */}
            {isFormEditable && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3 animate-fade-in">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormEditable(false);
                    toastSuccess('Reset', 'Form values reset.');
                    setFormData({
                      firstName: firstName,
                      lastName: lastName,
                      email: currentUser.email,
                      phone: '0711223344',
                      location: currentUser.branch?.name || 'Nairobi HQ',
                      nationalId: '12345678',
                      dob: '1992-08-15',
                      emergencyContact: 'Jane Mwangi - 0711111222',
                      bankAccount: '0110987654321',
                      mpesaNumber: '0711223344',
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold py-2 px-4 rounded-xl text-sm transition-all cursor-pointer shadow-sm btn-hover-scale"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-350 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer btn-hover-scale"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* ID Document view modal dialogue */}
      {idModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl border border-slate-200 animate-fade-in p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-800 capitalize">National ID - {idModal} View</h4>
              <button onClick={() => setIdModal(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer">✕</button>
            </div>
            
            <div className="bg-slate-100 border border-dashed border-slate-300 rounded-xl h-60 flex flex-col items-center justify-center text-slate-400 p-4">
              <div className="text-center space-y-2">
                <span className="text-4xl">🪪</span>
                <p className="text-sm font-bold text-slate-600">Scanned Document Image Preview</p>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">Encrypted document representing the scanned ID card {idModal} side registered for employee number {currentUser.employeeNumber || 'EMP001'}.</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="button"
                onClick={() => setIdModal(null)}
                className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-xl text-sm shadow-sm cursor-pointer transition-colors"
              >
                Done Viewing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
