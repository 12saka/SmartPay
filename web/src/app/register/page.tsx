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
  ShieldAlert, 
  KeyRound, 
  Mail, 
  User, 
  ShieldCheck,
  UserCheck,
  Briefcase,
  CreditCard,
  Fingerprint,
  Lock,
  Hourglass
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { branchService } from '@/services/api';
import styles from './Register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  // Wizard state
  const [flow, setFlow] = useState<'CHOICE' | 'CREATE_COMPANY' | 'REGISTER_EMPLOYEE'>('CHOICE');
  const [step, setStep] = useState(1);
  const totalSteps = 9; // Steps 2 to 10
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);

  // Form Fields State
  // Step 2: Create Account
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 3: Personal Details
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');

  // Step 4: Employment Info
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [branchId, setBranchId] = useState('');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');

  // Step 5: Bank & Payroll Details
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [basicSalary, setBasicSalary] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK');

  // Step 6: Identity Verification
  const [nationalId, setNationalId] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [biometricConsent, setBiometricConsent] = useState(false);

  // Step 7: Email OTP Verification
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // Step 8: Transaction PIN Setup
  const [transactionPin, setTransactionPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Load branches for selection
  useEffect(() => {
    async function loadBranches() {
      try {
        const list = await branchService.getAll();
        setBranches(list);
      } catch (err) {
        console.warn('Failed to load branches for selection.');
      }
    }
    loadBranches();
  }, []);

  const calculatePasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length > 7) strength += 25;
    if (pass.match(/[a-z]+/)) strength += 25;
    if (pass.match(/[A-Z]+/)) strength += 25;
    if (pass.match(/[0-9!@#$%^&*]+/)) strength += 25;
    return strength;
  };

  const passStrength = calculatePasswordStrength(password);
  let passColor = '#ef4444'; // default red
  if (passStrength > 50) passColor = '#f59e0b'; // warning amber
  if (passStrength > 75) passColor = '#10b981'; // success emerald

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
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleRegisterSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      const payload: any = {
        email,
        password,
        name: fullName,
        role: flow === 'CREATE_COMPANY' ? 'OWNER' : 'EMPLOYEE',
        phone,
        position,
        department,
        branchId: branchId ? parseInt(branchId) : null,
        salary: basicSalary ? parseFloat(basicSalary) : 25000,
        paymentMethod,
        accountNumber: paymentMethod === 'BANK' ? accountNumber : mobileNumber,
        nationalId: nationalId || 'ID-' + Math.floor(Math.random() * 1000000)
      };

      if (flow === 'CREATE_COMPANY') {
        payload.companyName = fullName + " Enterprise";
        payload.industry = "Retail";
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      // Register
      const regResponse = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const regData = await regResponse.json();
      if (!regResponse.ok) {
        throw new Error(regData.error || 'Registration failed');
      }

      // Auto login
      const logResponse = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const logData = await logResponse.json();
      if (!logResponse.ok) {
        throw new Error(logData.error || 'Login failed after registration');
      }

      login(logData.accessToken, logData.user);
      nextStep();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during submission.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProgress = () => {
    return (
      <div className="flex justify-center items-center space-x-2 mb-6">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const currentStepIndex = i + 2;
          const isActive = currentStepIndex === step;
          const isCompleted = currentStepIndex < step;
          return (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${
                isActive ? 'w-8 bg-emerald-600' : isCompleted ? 'w-2 bg-emerald-500' : 'w-2 bg-slate-200'
              }`}
            />
          );
        })}
      </div>
    );
  };

  // Step 1: Choice Landing Page
  const renderChoice = () => (
    <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-xl text-center flex flex-col space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Get Started with SmartPay</h1>
        <p className="text-slate-500 text-sm">Choose your onboarding pathway to set up your workspace</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Company Card */}
        <div 
          onClick={() => { setFlow('CREATE_COMPANY'); setStep(2); }}
          className="border border-slate-200 hover:border-emerald-500 bg-white hover:bg-slate-50 rounded-2xl p-6 text-center cursor-pointer transition-all hover:-translate-y-1 shadow-sm hover:shadow-lg flex flex-col items-center group"
        >
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Register Company</h3>
          <p className="text-slate-500 text-xs leading-relaxed mb-4">
            Create a new organization, set up branch systems, and manage corporate payroll.
          </p>
          <Button fullWidth>Create Company</Button>
        </div>

        {/* Employee Card */}
        <div 
          onClick={() => { setFlow('REGISTER_EMPLOYEE'); setStep(2); }}
          className="border border-slate-200 hover:border-emerald-500 bg-white hover:bg-slate-50 rounded-2xl p-6 text-center cursor-pointer transition-all hover:-translate-y-1 shadow-sm hover:shadow-lg flex flex-col items-center group"
        >
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Register as Employee</h3>
          <p className="text-slate-500 text-xs leading-relaxed mb-4">
            Join your organization, verify your identity, and set up your salary details.
          </p>
          <Button fullWidth variant="secondary">Join Organization</Button>
        </div>
      </div>
      
      <div className="border-t border-slate-100 pt-6">
        <button 
          onClick={() => router.push('/')}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          ← Return to Login Page
        </button>
      </div>
    </div>
  );

  const renderSteps = () => {
    switch (step) {
      // Step 2: Create Account credentials
      case 2:
        return (
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <button onClick={prevStep} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><ArrowLeft size={18}/></button>
              <span className="text-xs font-bold text-slate-400">Step 2 of 9</span>
            </div>
            {renderProgress()}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-slate-800">Create Your Account</h2>
              <p className="text-xs text-slate-400">Enter your secure credentials to sign up</p>
            </div>
            
            <div className="space-y-4">
              <Input label="Email Address" type="email" placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
              <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              
              {password && (
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full transition-all duration-300" style={{ width: `${passStrength}%`, backgroundColor: passColor }} />
                  </div>
                  <span className="text-[10px] font-bold block text-right" style={{ color: passColor }}>
                    Password Strength: {passStrength <= 25 ? 'Weak' : passStrength <= 50 ? 'Medium' : passStrength <= 75 ? 'Strong' : 'Very Strong'}
                  </span>
                </div>
              )}

              <Input label="Confirm Password" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>

            <Button onClick={nextStep} fullWidth disabled={!email || !password || password !== confirmPassword}>
              Continue <ArrowRight size={16} className="ml-1 inline" />
            </Button>
          </div>
        );

      // Step 3: Personal Details
      case 3:
        return (
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <button onClick={prevStep} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><ArrowLeft size={18}/></button>
              <span className="text-xs font-bold text-slate-400">Step 3 of 9</span>
            </div>
            {renderProgress()}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-slate-800">Personal Details</h2>
              <p className="text-xs text-slate-400">Please provide your personal contact info</p>
            </div>

            <div className="space-y-4">
              <Input label="Full Name" placeholder="e.g. Alice Wambui" value={fullName} onChange={e => setFullName(e.target.value)} required />
              <Input label="Phone Number" placeholder="e.g. +254 700 000 000" value={phone} onChange={e => setPhone(e.target.value)} required />
              <Input label="Date of Birth" type="date" value={dob} onChange={e => setDob(e.target.value)} required />
              <Input label="Residential Address" placeholder="e.g. Mombasa Road, Nairobi" value={address} onChange={e => setAddress(e.target.value)} required />
            </div>

            <Button onClick={nextStep} fullWidth disabled={!fullName || !phone || !dob || !address}>
              Continue <ArrowRight size={16} className="ml-1 inline" />
            </Button>
          </div>
        );

      // Step 4: Employment Information
      case 4:
        return (
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <button onClick={prevStep} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><ArrowLeft size={18}/></button>
              <span className="text-xs font-bold text-slate-400">Step 4 of 9</span>
            </div>
            {renderProgress()}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-slate-800">Employment Details</h2>
              <p className="text-xs text-slate-400">Enter your branch and position details</p>
            </div>

            <div className="space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Assigned Branch</label>
                <select 
                  value={branchId}
                  onChange={e => setBranchId(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">HQ Office (All Branches)</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <Input label="Department" placeholder="e.g. Operations / Finance" value={department} onChange={e => setDepartment(e.target.value)} required />
              <Input label="Job Title / Position" placeholder="e.g. Accountant / Sales Lead" value={position} onChange={e => setPosition(e.target.value)} required />
              
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Employment Type</label>
                <select 
                  value={employmentType}
                  onChange={e => setEmploymentType(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="CONTRACT">Contract Basis</option>
                  <option value="CASUAL">Casual Labor</option>
                </select>
              </div>
            </div>

            <Button onClick={nextStep} fullWidth disabled={!position || !department}>
              Continue <ArrowRight size={16} className="ml-1 inline" />
            </Button>
          </div>
        );

      // Step 5: Bank & Payroll Details
      case 5:
        return (
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <button onClick={prevStep} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><ArrowLeft size={18}/></button>
              <span className="text-xs font-bold text-slate-400">Step 5 of 9</span>
            </div>
            {renderProgress()}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-slate-800">Bank & Payroll Details</h2>
              <p className="text-xs text-slate-400">Set up your disbursement routing preferences</p>
            </div>

            <div className="space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Payment Type</label>
                <select 
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="BANK">Bank Transfer</option>
                  <option value="MPESA">M-Pesa Mobile Wallet</option>
                </select>
              </div>

              {paymentMethod === 'BANK' ? (
                <>
                  <Input label="Bank Name" placeholder="e.g. KCB Bank / Equity Bank" value={bankName} onChange={e => setBankName(e.target.value)} required />
                  <Input label="Account Number" placeholder="e.g. 1209 4820 1823" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} required />
                </>
              ) : (
                <Input label="M-Pesa Registered Number" placeholder="e.g. 0712345678" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} required />
              )}

              <Input label="Expected Basic Salary (KES)" type="number" placeholder="e.g. 45000" value={basicSalary} onChange={e => setBasicSalary(e.target.value)} required />
            </div>

            <Button 
              onClick={nextStep} 
              fullWidth 
              disabled={
                !basicSalary || 
                (paymentMethod === 'BANK' ? (!bankName || !accountNumber) : !mobileNumber)
              }
            >
              Continue <ArrowRight size={16} className="ml-1 inline" />
            </Button>
          </div>
        );

      // Step 6: Identity Verification
      case 6:
        return (
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <button onClick={prevStep} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><ArrowLeft size={18}/></button>
              <span className="text-xs font-bold text-slate-400">Step 6 of 9</span>
            </div>
            {renderProgress()}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-slate-800">Identity Verification</h2>
              <p className="text-xs text-slate-400">Please provide security and identification records</p>
            </div>

            <div className="space-y-4 text-left">
              <Input label="National ID or Passport Number" placeholder="e.g. 36728912" value={nationalId} onChange={e => setNationalId(e.target.value)} required />
              <Input label="ID/Passport Scan URL" placeholder="e.g. https://storage.com/scans/id.jpg" value={documentUrl} onChange={e => setDocumentUrl(e.target.value)} />
              
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start space-x-3 mt-2">
                <input 
                  type="checkbox" 
                  id="consent" 
                  className="mt-1 border-slate-300 rounded text-emerald-600 focus:ring-emerald-500" 
                  checked={biometricConsent}
                  onChange={e => setBiometricConsent(e.target.checked)}
                />
                <label htmlFor="consent" className="text-[10px] font-medium text-slate-500 leading-normal">
                  I consent to the collection and verification of my biometric and identity credentials for payroll settlement auditing purposes.
                </label>
              </div>
            </div>

            <Button onClick={nextStep} fullWidth disabled={!nationalId || !biometricConsent}>
              Continue <ArrowRight size={16} className="ml-1 inline" />
            </Button>
          </div>
        );

      // Step 7: Email OTP Verification
      case 7:
        return (
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <button onClick={prevStep} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><ArrowLeft size={18}/></button>
              <span className="text-xs font-bold text-slate-400">Step 7 of 9</span>
            </div>
            {renderProgress()}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-slate-800">Verify Your Email</h2>
              <p className="text-xs text-slate-400">We sent a 6-digit OTP code to <strong>{email || 'your email'}</strong></p>
            </div>

            <div className="flex justify-center space-x-2 my-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  className="w-12 h-14 border border-slate-200 rounded-xl text-center font-bold text-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                />
              ))}
            </div>

            <div className="text-center">
              <a href="#" className="text-xs font-bold text-emerald-600 hover:underline">Resend Verification Code</a>
            </div>

            <Button onClick={nextStep} fullWidth disabled={otp.join('').length !== 6}>
              Verify Code <ArrowRight size={16} className="ml-1 inline" />
            </Button>
          </div>
        );

      // Step 8: Transaction PIN Setup
      case 8:
        return (
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <button onClick={prevStep} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><ArrowLeft size={18}/></button>
              <span className="text-xs font-bold text-slate-400">Step 8 of 9</span>
            </div>
            {renderProgress()}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-slate-800">Transaction PIN</h2>
              <p className="text-xs text-slate-400">Configure a secure 4-digit PIN for processing actions</p>
            </div>

            <div className="space-y-4">
              <Input label="Enter 4-Digit Security PIN" type="password" maxLength={4} placeholder="••••" value={transactionPin} onChange={e => setTransactionPin(e.target.value.replace(/\D/g,''))} required />
              <Input label="Confirm Security PIN" type="password" maxLength={4} placeholder="••••" value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g,''))} required />
            </div>

            {error && <span className="text-xs text-rose-500 block text-center font-medium">{error}</span>}

            <Button onClick={handleRegisterSubmit} fullWidth disabled={transactionPin.length !== 4 || transactionPin !== confirmPin || isLoading}>
              {isLoading ? 'Creating Profile...' : 'Set Security PIN'}
            </Button>
          </div>
        );

      // Step 9: Account Approval (Manager/Admin review)
      case 9:
        return (
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center flex flex-col space-y-6 py-10">
            <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
              <Hourglass className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-800">Awaiting Profile Approval</h2>
              <p className="text-xs text-slate-400 leading-relaxed px-4">
                Your employee profile has been registered. Before you can access the dashboard, your branch administrator or supervisor must review and approve your bank details.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-semibold text-slate-500 space-y-1.5 text-left">
              <div className="flex justify-between">
                <span>Account Number:</span>
                <span className="font-bold text-slate-700">{paymentMethod === 'BANK' ? accountNumber : mobileNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Verified Name:</span>
                <span className="font-bold text-slate-700">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span>Branch Reference:</span>
                <span className="font-bold text-slate-700">Pending HQ Mapping</span>
              </div>
            </div>

            <Button onClick={nextStep} fullWidth>
              Continue to Dashboard Verification
            </Button>
          </div>
        );

      // Step 10: Dashboard Access
      case 10:
        return (
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center flex flex-col space-y-6 py-10">
            <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-800">Account Activated</h2>
              <p className="text-xs text-slate-400">Onboarding checklist completed successfully</p>
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
    <div className="min-h-screen bg-slate-550 flex flex-col items-center justify-center p-6 select-none bg-slate-50">
      {/* Brand Header */}
      <div className="mb-8 flex items-center space-x-2.5 cursor-pointer" onClick={() => router.push('/')}>
        <div className="bg-emerald-600 p-2 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/10">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </div>
        <div className="text-xl font-bold tracking-tight text-slate-900 flex items-center">
          smart<span className="text-emerald-600 font-extrabold ml-0.5">Pay</span>
        </div>
      </div>

      {flow === 'CHOICE' ? renderChoice() : renderSteps()}
    </div>
  );
}
