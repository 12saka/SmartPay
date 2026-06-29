"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { 
  Building2, 
  Users, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  KeyRound, 
  Mail, 
  User, 
  Fingerprint,
  Hourglass,
  Check
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { branchService } from '@/services/api';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  // Navigation Flow State
  const [flow, setFlow] = useState<'CHOICE' | 'CREATE_COMPANY' | 'REGISTER_EMPLOYEE'>('CHOICE');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);

  // --- Form State ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Company-specific State
  const [companyName, setCompanyName] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('Retail');
  const [selectedCurrency, setSelectedCurrency] = useState('KES');

  // Employee-specific State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [branchId, setBranchId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [basicSalary, setBasicSalary] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [biometricConsent, setBiometricConsent] = useState(false);

  // OTP Verification Code
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // Transaction PIN
  const [transactionPin, setTransactionPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const industries = ['Supermarket', 'Retail', 'Logistics', 'Technology'];
  const currencies = ['KES', 'USD', 'EUR'];

  // Load branches
  useEffect(() => {
    async function loadBranches() {
      try {
        const list = await branchService.getAll();
        setBranches(list);
      } catch (err) {
        console.warn('Could not fetch branches list.');
      }
    }
    if (flow === 'REGISTER_EMPLOYEE') {
      loadBranches();
    }
  }, [flow]);

  const calculatePasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length > 7) strength += 25;
    if (pass.match(/[a-z]+/)) strength += 25;
    if (pass.match(/[A-Z]+/)) strength += 25;
    if (pass.match(/[0-9!@#$%^&*]+/)) strength += 25;
    return strength;
  };

  const passStrength = calculatePasswordStrength(password);
  let passColor = '#ef4444'; 
  if (passStrength > 50) passColor = '#f59e0b'; 
  if (passStrength > 75) passColor = '#10b981'; 

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 10));
  const prevStep = () => {
    if (step === 2) {
      setFlow('CHOICE');
      setStep(1);
    } else {
      setStep((prev) => Math.max(prev - 1, 1));
    }
    setError('');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleCompanySubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      const payload = {
        email,
        password,
        name: companyName + " Manager",
        role: 'OWNER',
        companyName,
        industry: selectedIndustry,
        currency: selectedCurrency,
        payrollFrequency: 'MONTHLY',
        paymentMethod: 'BOTH',
        timezone: 'Africa/Nairobi',
        workingDays: 'Monday-Friday'
      };

      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const regResponse = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const regData = await regResponse.json();
      if (!regResponse.ok) {
        throw new Error(regData.error || 'Failed to register organization');
      }

      // Login
      const logResponse = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const logData = await logResponse.json();
      if (!logResponse.ok) {
        throw new Error(logData.error || 'Failed to authenticate');
      }

      login(logData.accessToken, logData.user);
      setStep(5); // Success step
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      const payload = {
        email,
        password,
        name: fullName,
        role: 'EMPLOYEE',
        phone,
        position,
        department,
        branchId: branchId ? parseInt(branchId) : null,
        salary: basicSalary ? parseFloat(basicSalary) : 25000,
        paymentMethod,
        accountNumber: paymentMethod === 'BANK' ? accountNumber : mobileNumber,
        nationalId: nationalId || 'ID-' + Math.floor(Math.random() * 1000000)
      };

      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      const regResponse = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const regData = await regResponse.json();
      if (!regResponse.ok) {
        throw new Error(regData.error || 'Failed to create employee profile');
      }

      // Login
      const logResponse = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const logData = await logResponse.json();
      if (!logResponse.ok) {
        throw new Error(logData.error || 'Failed to authenticate');
      }

      login(logData.accessToken, logData.user);
      setStep(9); // Awaiting approval
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderChoice = () => (
    <div className="w-full max-w-2xl bg-white border border-slate-150 rounded-3xl p-8 md:p-10 shadow-xl text-center flex flex-col space-y-6 animate-slide-up">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Onboarding Gateway</h1>
        <p className="text-slate-500 text-sm">Select your administrative portal type to begin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Company Card */}
        <div 
          onClick={() => { setFlow('CREATE_COMPANY'); setStep(2); }}
          className="border border-slate-150 hover:border-emerald-500 bg-white hover:bg-slate-50/55 rounded-2xl p-6 text-center cursor-pointer transition-all hover:-translate-y-1 shadow-sm hover:shadow-md flex flex-col items-center group"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">Register Company</h3>
          <p className="text-slate-500 text-[11px] leading-relaxed mb-4">
            Register a company, configure workspaces, and set up your manager dashboard.
          </p>
          <Button fullWidth>Begin Setup</Button>
        </div>

        {/* Employee Card */}
        <div 
          onClick={() => { setFlow('REGISTER_EMPLOYEE'); setStep(2); }}
          className="border border-slate-150 hover:border-emerald-500 bg-white hover:bg-slate-50/55 rounded-2xl p-6 text-center cursor-pointer transition-all hover:-translate-y-1 shadow-sm hover:shadow-md flex flex-col items-center group"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">Register as Employee</h3>
          <p className="text-slate-500 text-[11px] leading-relaxed mb-4">
            Connect to an active branch, register your payment details, and wait for audit sign-offs.
          </p>
          <Button fullWidth variant="secondary">Join Team</Button>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6">
        <button onClick={() => router.push('/')} className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors">
          ← Back to Landing Page
        </button>
      </div>
    </div>
  );

  // --- FLOW A: CREATE COMPANY WIZARD (4 Steps + Success) ---
  const renderCompanyWizard = () => {
    switch (step) {
      // Step 2: Account Login Credentials
      case 2:
        return (
          <div className="w-full max-w-md bg-white border border-slate-150 rounded-2xl p-7 shadow-lg flex flex-col space-y-5 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <button onClick={prevStep} className="p-1.5 hover:bg-slate-150 rounded text-slate-400"><ArrowLeft size={16}/></button>
              <span className="text-[10px] font-bold text-slate-400">Step 1 of 4</span>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-800">Account Credentials</h2>
              <p className="text-[11px] text-slate-400">Enter email and password for administrative credentials</p>
            </div>
            
            <div className="space-y-3.5">
              <Input label="Admin Email" type="email" placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
              <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              
              {password && (
                <div className="space-y-1">
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full transition-all duration-300" style={{ width: `${passStrength}%`, backgroundColor: passColor }} />
                  </div>
                  <span className="text-[9px] font-bold block text-right" style={{ color: passColor }}>
                    Password: {passStrength <= 25 ? 'Weak' : passStrength <= 50 ? 'Medium' : passStrength <= 75 ? 'Strong' : 'Very Strong'}
                  </span>
                </div>
              )}
              <Input label="Confirm Password" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>

            <Button onClick={() => setStep(3)} fullWidth disabled={!email || !password || password !== confirmPassword}>
              Continue
            </Button>
          </div>
        );

      // Step 3: Company Setup with autopick presets
      case 3:
        return (
          <div className="w-full max-w-md bg-white border border-slate-150 rounded-2xl p-7 shadow-lg flex flex-col space-y-5 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <button onClick={() => setStep(2)} className="p-1.5 hover:bg-slate-150 rounded text-slate-400"><ArrowLeft size={16}/></button>
              <span className="text-[10px] font-bold text-slate-400">Step 2 of 4</span>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-800">Company Information</h2>
              <p className="text-[11px] text-slate-400">Tell us about your organization</p>
            </div>

            <div className="space-y-4">
              <Input label="Company Name" placeholder="e.g. SuperMart Ltd" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
              
              {/* Autopick Industry Presets */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-500 block">Industry (Autopick)</label>
                <div className="grid grid-cols-2 gap-2">
                  {industries.map(ind => (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => setSelectedIndustry(ind)}
                      className={`py-2 px-3 text-xs font-bold border rounded-lg transition-all flex items-center justify-center space-x-1 ${
                        selectedIndustry === ind 
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-650 hover:bg-slate-50'
                      }`}
                    >
                      {selectedIndustry === ind && <Check size={12} />}
                      <span>{ind}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Autopick Currency Presets */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-500 block">Payroll Currency (Autopick)</label>
                <div className="flex space-x-2">
                  {currencies.map(curr => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setSelectedCurrency(curr)}
                      className={`flex-1 py-2 px-3 text-xs font-bold border rounded-lg transition-all flex items-center justify-center space-x-1 ${
                        selectedCurrency === curr 
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-650 hover:bg-slate-50'
                      }`}
                    >
                      {selectedCurrency === curr && <Check size={12} />}
                      <span>{curr}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={() => setStep(4)} fullWidth disabled={!companyName}>
              Continue
            </Button>
          </div>
        );

      // Step 4: OTP Verification
      case 4:
        return (
          <div className="w-full max-w-md bg-white border border-slate-150 rounded-2xl p-7 shadow-lg flex flex-col space-y-5 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <button onClick={() => setStep(3)} className="p-1.5 hover:bg-slate-150 rounded text-slate-400"><ArrowLeft size={16}/></button>
              <span className="text-[10px] font-bold text-slate-400">Step 3 of 4</span>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-800">Verify Email</h2>
              <p className="text-[11px] text-slate-400">Enter the 6-digit verification code sent to {email}</p>
            </div>

            <div className="flex justify-center space-x-2.5 my-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  className="w-10 h-12 border border-slate-200 rounded-lg text-center font-bold text-base focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                />
              ))}
            </div>

            {error && <span className="text-xs text-rose-500 block text-center font-medium">{error}</span>}

            <Button onClick={handleCompanySubmit} fullWidth disabled={otp.join('').length !== 6 || isLoading}>
              {isLoading ? 'Creating Company...' : 'Verify & Finish'}
            </Button>
          </div>
        );

      // Step 5: Success
      case 5:
        return (
          <div className="w-full max-w-md bg-white border border-slate-150 rounded-2xl p-8 shadow-lg text-center flex flex-col space-y-5 py-8 animate-slide-up">
            <div className="w-14 h-14 bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-slate-800">Setup Complete!</h2>
              <p className="text-xs text-slate-500 px-4">
                Your organization has been configured successfully. Administrative privileges have been activated.
              </p>
            </div>

            <Button onClick={() => router.push('/dashboard')} fullWidth>
              Access Dashboard
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  // --- FLOW B: REGISTER EMPLOYEE WIZARD (10 Steps) ---
  const renderEmployeeWizard = () => {
    switch (step) {
      // Step 2: Create Account credentials
      case 2:
        return (
          <div className="w-full max-w-md bg-white border border-slate-150 rounded-2xl p-7 shadow-lg flex flex-col space-y-5 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <button onClick={prevStep} className="p-1.5 hover:bg-slate-150 rounded text-slate-400"><ArrowLeft size={16}/></button>
              <span className="text-[10px] font-bold text-slate-400">Step 1 of 9</span>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-800">Account Credentials</h2>
              <p className="text-[11px] text-slate-400">Enter secure login credentials</p>
            </div>

            <div className="space-y-3.5">
              <Input label="Email Address" type="email" placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
              <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              
              {password && (
                <div className="space-y-1">
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full transition-all duration-300" style={{ width: `${passStrength}%`, backgroundColor: passColor }} />
                  </div>
                  <span className="text-[9px] font-bold block text-right" style={{ color: passColor }}>
                    Password: {passStrength <= 25 ? 'Weak' : passStrength <= 50 ? 'Medium' : passStrength <= 75 ? 'Strong' : 'Very Strong'}
                  </span>
                </div>
              )}

              <Input label="Confirm Password" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>

            <Button onClick={() => setStep(3)} fullWidth disabled={!email || !password || password !== confirmPassword}>
              Continue
            </Button>
          </div>
        );

      // Step 3: Personal Details
      case 3:
        return (
          <div className="w-full max-w-md bg-white border border-slate-150 rounded-2xl p-7 shadow-lg flex flex-col space-y-5 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <button onClick={() => setStep(2)} className="p-1.5 hover:bg-slate-150 rounded text-slate-400"><ArrowLeft size={16}/></button>
              <span className="text-[10px] font-bold text-slate-400">Step 2 of 9</span>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-800">Personal Details</h2>
              <p className="text-[11px] text-slate-400">Provide basic profile details</p>
            </div>

            <div className="space-y-3.5">
              <Input label="Full Name" placeholder="e.g. Alice Wambui" value={fullName} onChange={e => setFullName(e.target.value)} required />
              <Input label="Phone Number" placeholder="e.g. +254 700 000 000" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>

            <Button onClick={() => setStep(4)} fullWidth disabled={!fullName || !phone}>
              Continue
            </Button>
          </div>
        );

      // Step 4: Employment Information
      case 4:
        return (
          <div className="w-full max-w-md bg-white border border-slate-150 rounded-2xl p-7 shadow-lg flex flex-col space-y-5 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <button onClick={() => setStep(3)} className="p-1.5 hover:bg-slate-150 rounded text-slate-400"><ArrowLeft size={16}/></button>
              <span className="text-[10px] font-bold text-slate-400">Step 3 of 9</span>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-800">Employment Details</h2>
              <p className="text-[11px] text-slate-400">Enter branch and position parameters</p>
            </div>

            <div className="space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Assigned Branch</label>
                <select 
                  value={branchId}
                  onChange={e => setBranchId(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-850 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">HQ Office (All Branches)</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <Input label="Department" placeholder="e.g. Operations / Finance" value={department} onChange={e => setDepartment(e.target.value)} required />
              <Input label="Job Title / Position" placeholder="e.g. Accountant / Sales Lead" value={position} onChange={e => setPosition(e.target.value)} required />
            </div>

            <Button onClick={() => setStep(5)} fullWidth disabled={!position || !department}>
              Continue
            </Button>
          </div>
        );

      // Step 5: Bank & Payroll Details
      case 5:
        return (
          <div className="w-full max-w-md bg-white border border-slate-150 rounded-2xl p-7 shadow-lg flex flex-col space-y-5 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <button onClick={() => setStep(4)} className="p-1.5 hover:bg-slate-150 rounded text-slate-400"><ArrowLeft size={16}/></button>
              <span className="text-[10px] font-bold text-slate-400">Step 4 of 9</span>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-800">Bank & Payroll</h2>
              <p className="text-[11px] text-slate-400">Choose disbursement details</p>
            </div>

            <div className="space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Disbursement Type</label>
                <select 
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-850 focus:outline-none focus:border-emerald-500"
                >
                  <option value="BANK">Bank Account Transfer</option>
                  <option value="MPESA">M-Pesa Mobile Wallet</option>
                </select>
              </div>

              {paymentMethod === 'BANK' ? (
                <>
                  <Input label="Bank Name" placeholder="e.g. KCB Bank" value={bankName} onChange={e => setBankName(e.target.value)} required />
                  <Input label="Account Number" placeholder="e.g. 1209 4820" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} required />
                </>
              ) : (
                <Input label="M-Pesa Mobile Number" placeholder="e.g. 0712345678" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} required />
              )}

              <Input label="Basic Salary (KES)" type="number" placeholder="e.g. 45000" value={basicSalary} onChange={e => setBasicSalary(e.target.value)} required />
            </div>

            <Button 
              onClick={() => setStep(6)} 
              fullWidth 
              disabled={
                !basicSalary || 
                (paymentMethod === 'BANK' ? (!bankName || !accountNumber) : !mobileNumber)
              }
            >
              Continue
            </Button>
          </div>
        );

      // Step 6: Identity Verification
      case 6:
        return (
          <div className="w-full max-w-md bg-white border border-slate-150 rounded-2xl p-7 shadow-lg flex flex-col space-y-5 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <button onClick={() => setStep(5)} className="p-1.5 hover:bg-slate-150 rounded text-slate-400"><ArrowLeft size={16}/></button>
              <span className="text-[10px] font-bold text-slate-400">Step 5 of 9</span>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-800">Identity Details</h2>
              <p className="text-[11px] text-slate-400">Verify government identification records</p>
            </div>

            <div className="space-y-4 text-left">
              <Input label="National ID Number" placeholder="e.g. 36728912" value={nationalId} onChange={e => setNationalId(e.target.value)} required />
              
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start space-x-3 mt-2">
                <input 
                  type="checkbox" 
                  id="consent" 
                  className="mt-1 border-slate-350 rounded text-emerald-600 focus:ring-emerald-500" 
                  checked={biometricConsent}
                  onChange={e => setBiometricConsent(e.target.checked)}
                />
                <label htmlFor="consent" className="text-[10px] font-medium text-slate-500 leading-normal">
                  I consent to the collection of my biometric details for payroll settlements.
                </label>
              </div>
            </div>

            <Button onClick={() => setStep(7)} fullWidth disabled={!nationalId || !biometricConsent}>
              Continue
            </Button>
          </div>
        );

      // Step 7: Email OTP Verification
      case 7:
        return (
          <div className="w-full max-w-md bg-white border border-slate-150 rounded-2xl p-7 shadow-lg flex flex-col space-y-5 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <button onClick={() => setStep(6)} className="p-1.5 hover:bg-slate-150 rounded text-slate-400"><ArrowLeft size={16}/></button>
              <span className="text-[10px] font-bold text-slate-400">Step 6 of 9</span>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-800">Verify Email</h2>
              <p className="text-[11px] text-slate-400">Enter the 6-digit OTP code sent to {email}</p>
            </div>

            <div className="flex justify-center space-x-2 my-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  className="w-10 h-12 border border-slate-200 rounded-lg text-center font-bold text-base focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                />
              ))}
            </div>

            <div className="text-center">
              <a href="#" className="text-xs font-bold text-emerald-600 hover:underline">Resend Code</a>
            </div>

            <Button onClick={() => setStep(8)} fullWidth disabled={otp.join('').length !== 6}>
              Verify
            </Button>
          </div>
        );

      // Step 8: Transaction PIN Setup
      case 8:
        return (
          <div className="w-full max-w-md bg-white border border-slate-150 rounded-2xl p-7 shadow-lg flex flex-col space-y-5 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <button onClick={() => setStep(7)} className="p-1.5 hover:bg-slate-150 rounded text-slate-400"><ArrowLeft size={16}/></button>
              <span className="text-[10px] font-bold text-slate-400">Step 7 of 9</span>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-800">Security PIN</h2>
              <p className="text-[11px] text-slate-400">Create a 4-digit PIN for transactions authorization</p>
            </div>

            <div className="space-y-4">
              <Input label="Enter 4-Digit PIN" type="password" maxLength={4} placeholder="••••" value={transactionPin} onChange={e => setTransactionPin(e.target.value.replace(/\D/g,''))} required />
              <Input label="Confirm PIN" type="password" maxLength={4} placeholder="••••" value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g,''))} required />
            </div>

            {error && <span className="text-xs text-rose-500 block text-center font-medium">{error}</span>}

            <Button onClick={handleEmployeeSubmit} fullWidth disabled={transactionPin.length !== 4 || transactionPin !== confirmPin || isLoading}>
              {isLoading ? 'Registering...' : 'Complete Registration'}
            </Button>
          </div>
        );

      // Step 9: Awaiting Approval (Pending status)
      case 9:
        return (
          <div className="w-full max-w-md bg-white border border-slate-150 rounded-2xl p-8 shadow-lg text-center flex flex-col space-y-5 py-8 animate-slide-up">
            <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
              <Hourglass className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-slate-800">Awaiting Manager Approval</h2>
              <p className="text-xs text-slate-500 leading-relaxed px-4">
                Your profile has been created. Once a branch manager approves your disbursement details, you will have access to the dashboard.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-semibold text-slate-550 space-y-1 text-left">
              <div className="flex justify-between">
                <span>Account Reference:</span>
                <span className="font-bold text-slate-800">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span>Routing:</span>
                <span className="font-bold text-slate-800">{paymentMethod}</span>
              </div>
            </div>

            <Button onClick={() => setStep(10)} fullWidth>
              Continue to Dashboard Verification
            </Button>
          </div>
        );

      // Step 10: Dashboard Access
      case 10:
        return (
          <div className="w-full max-w-md bg-white border border-slate-150 rounded-2xl p-8 shadow-lg text-center flex flex-col space-y-5 py-8 animate-slide-up">
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-150 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 size={36} />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-slate-800">Account Activated</h2>
              <p className="text-xs text-slate-500">Your profile validation is complete</p>
            </div>

            <Button onClick={() => router.push('/dashboard')} fullWidth>
              Access Dashboard
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 select-none">
      {/* Brand Header */}
      <div className="mb-6 flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/')}>
        <div className="bg-emerald-600 p-2 rounded-xl flex items-center justify-center text-white shadow-md">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </div>
        <div className="text-lg font-bold tracking-tight text-slate-900 flex items-center">
          smart<span className="text-emerald-600 font-extrabold ml-0.5">Pay</span>
        </div>
      </div>

      {flow === 'CHOICE' && renderChoice()}
      {flow === 'CREATE_COMPANY' && renderCompanyWizard()}
      {flow === 'REGISTER_EMPLOYEE' && renderEmployeeWizard()}
    </div>
  );
}
