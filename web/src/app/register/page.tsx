"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Users, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';
import styles from './Register.module.css';

type RegisterFlow = 'CHOICE' | 'CREATE_COMPANY' | 'JOIN_COMPANY';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [flow, setFlow] = useState<RegisterFlow>('CHOICE');
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const submitRegistration = async (isJoin: boolean) => {
    setIsLoading(true);
    setError('');
    try {
      const payload: any = {
        email,
        password,
        name: fullName,
        role: isJoin ? 'MANAGER' : 'OWNER'
      };
 
      if (!isJoin) {
        payload.companyName = companyName;
        payload.industry = industry;
        payload.currency = 'KES';
        payload.payrollFrequency = 'MONTHLY';
        payload.paymentMethod = 'BANK';
        payload.timezone = 'Africa/Nairobi';
        payload.workingDays = 'Monday-Friday';
      }
 
      // Register the user & organization
      const regResponse = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
 
      const regData = await regResponse.json();
      if (!regResponse.ok) {
        throw new Error(regData.error || 'Registration failed');
      }
 
      // Automatically log in the user
      const logResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
 
      const logData = await logResponse.json();
      if (!logResponse.ok) {
        throw new Error(logData.error || 'Failed to login after registration');
      }
 
      login(logData.accessToken, logData.user);
      nextStep();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length > 7) strength += 25;
    if (pass.match(/[a-z]+/)) strength += 25;
    if (pass.match(/[A-Z]+/)) strength += 25;
    if (pass.match(/[0-9!@#$%^&*]+/)) strength += 25;
    return strength;
  };

  const passStrength = calculatePasswordStrength(password);
  let passColor = 'var(--border)';
  if (passStrength > 0) passColor = 'var(--danger)';
  if (passStrength > 50) passColor = '#f59e0b'; // warning
  if (passStrength > 75) passColor = 'var(--accent)'; // success

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps + 1));
  const prevStep = () => {
    if (step === 1) {
      setFlow('CHOICE');
    } else {
      setStep((prev) => Math.max(prev - 1, 1));
    }
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

  const renderProgress = () => {
    return (
      <div className={styles.progressContainer}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div 
            key={i} 
            className={`${styles.progressDot} ${i + 1 === step ? styles.active : ''} ${i + 1 < step ? styles.completed : ''}`} 
          />
        ))}
      </div>
    );
  };

  const renderChoice = () => (
    <div className={`animate-fade-in ${styles.wizardContainer}`}>
      <div className={styles.header}>
        <h1>What would you like to do?</h1>
        <p>Choose how you want to start using SmartPay</p>
      </div>
      
      <div className={styles.choiceContainer}>
        <div 
          className={styles.choiceCard}
          onClick={() => { setFlow('CREATE_COMPANY'); setStep(2); }}
        >
          <div className={styles.iconWrapper}><Building2 size={48} color="var(--primary)" /></div>
          <div className={styles.choiceTitle}>Start a New Company</div>
          <div className={styles.choiceDesc}>
            Create your organization and become its manager with full administrative privileges.
          </div>
          <Button fullWidth>Create Company <ChevronRight size={16} style={{marginLeft: '0.5rem'}} /></Button>
        </div>

        <div 
          className={styles.choiceCard}
          onClick={() => { setFlow('JOIN_COMPANY'); setStep(2); }}
        >
          <div className={styles.iconWrapper}><Users size={48} color="var(--accent)" /></div>
          <div className={styles.choiceTitle}>Join Existing Company</div>
          <div className={styles.choiceDesc}>
            Join an organization after receiving an invitation from its administrator.
          </div>
          <Button fullWidth variant="secondary">Join Company <ChevronRight size={16} style={{marginLeft: '0.5rem'}} /></Button>
        </div>
      </div>
      <div style={{textAlign: 'center', marginTop: '2rem'}}>
        <Button variant="secondary" onClick={() => router.push('/')}>Back to Login</Button>
      </div>
    </div>
  );

  const renderCreateCompanySteps = () => {
    switch (step) {
      case 2:
        return (
          <div className={styles.wizardContainer}>
            <Button variant="secondary" onClick={prevStep} style={{marginBottom: '1rem', padding: '0.5rem'}}><ArrowLeft size={16}/></Button>
            {renderProgress()}
            <div className={styles.header}>
              <h2>Organization Information</h2>
              <p>Tell us about your company</p>
            </div>
            <div className={styles.formGrid}>
              <Input label="Company Name" placeholder="ABC Supermarket" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
              <Input label="Business Registration Number" placeholder="Optional" />
              <Input label="Industry" placeholder="e.g. Retail" value={industry} onChange={e => setIndustry(e.target.value)} required />
              <Input label="Organization Size" placeholder="1-50 employees" />
              <div className={styles.fullWidth}>
                <Input label="Company Email" type="email" placeholder="hello@company.com" />
              </div>
            </div>
            <div className={styles.buttonGroup}>
              <Button onClick={nextStep}>Continue</Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className={styles.wizardContainer}>
            <Button variant="secondary" onClick={prevStep} style={{marginBottom: '1rem', padding: '0.5rem'}}><ArrowLeft size={16}/></Button>
            {renderProgress()}
            <div className={styles.header}>
              <h2>Manager Information</h2>
              <p>Set up your administrator profile</p>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.fullWidth}>
                <Input label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              <Input label="Phone Number" placeholder="+254..." />
              
              <div className={styles.fullWidth}>
                <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                <div className={styles.passwordMeter}>
                  <div className={styles.passwordMeterBar} style={{ width: `${passStrength}%`, backgroundColor: passColor }} />
                </div>
                {password && (
                  <div className={styles.passwordMeterText} style={{color: passColor}}>
                    {passStrength <= 25 ? 'Weak' : passStrength <= 50 ? 'Medium' : passStrength <= 75 ? 'Strong' : 'Very Strong'}
                  </div>
                )}
              </div>
              <div className={styles.fullWidth}>
                <Input label="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
            </div>
            <div className={styles.buttonGroup}>
              <Button onClick={nextStep} disabled={!password || password !== confirmPassword}>Continue</Button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className={styles.wizardContainer}>
            <Button variant="secondary" onClick={prevStep} style={{marginBottom: '1rem', padding: '0.5rem'}}><ArrowLeft size={16}/></Button>
            {renderProgress()}
            <div className={styles.header}>
              <h2>Verify Your Email</h2>
              <p>We sent a six-digit code to <strong>{email || 'your email'}</strong></p>
            </div>
            
            <div className={styles.otpContainer}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  className={styles.otpInput}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                />
              ))}
            </div>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <a href="#" className={styles.choiceDesc} style={{color: 'var(--primary)', textDecoration: 'underline'}}>Resend Code</a>
            </div>

            <div className={styles.buttonGroup} style={{justifyContent: 'center'}}>
              <Button onClick={nextStep} fullWidth disabled={otp.join('').length !== 6}>Verify</Button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className={`animate-slide-up ${styles.wizardContainer}`}>
            {renderProgress()}
            <div className={styles.header}>
              <h2>Organization Setup</h2>
              <p>Configure your company preferences</p>
            </div>
            <div className={styles.formGrid}>
              <Input label="Currency" defaultValue="KES" />
              <Input label="Payroll Frequency" defaultValue="Monthly" />
              <div className={styles.fullWidth}>
                <Input label="Payment Method" defaultValue="Both (Bank & M-Pesa)" />
              </div>
              <Input label="Timezone" defaultValue="Africa/Nairobi" />
              <Input label="Working Days" defaultValue="Mon - Fri" />
            </div>
            <div className={styles.buttonGroup} style={{flexDirection: 'column', gap: '1rem', width: '100%'}}>
              {error && <div className={styles.globalError} style={{color: 'var(--danger)', fontSize: '0.875rem'}}>{error}</div>}
              <Button onClick={() => submitRegistration(false)} fullWidth disabled={isLoading}>
                {isLoading ? 'Creating Company...' : 'Finish Setup'}
              </Button>
            </div>
          </div>
        );
      case 6: // Success
        return (
          <div className={styles.wizardContainer} style={{textAlign: 'center', padding: '4rem 2rem'}}>
            <div className={styles.successIcon}>
              <CheckCircle2 size={48} />
            </div>
            <div className={styles.header}>
              <h2>Welcome to SmartPay, {fullName}!</h2>
              <p className={styles.choiceDesc}>Your organization has been created successfully. Start by inviting your team members to {companyName || 'your company'}.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '0 auto' }}>
              <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
              <Button variant="secondary">Invite Employees</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderJoinCompanySteps = () => {
    switch (step) {
      case 2:
        return (
          <div className={styles.wizardContainer}>
            <Button variant="secondary" onClick={prevStep} style={{marginBottom: '1rem', padding: '0.5rem'}}><ArrowLeft size={16}/></Button>
            {renderProgress()}
            <div className={styles.header}>
              <h2>Enter Invitation Details</h2>
              <p>Use your company code or invitation link</p>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.fullWidth}>
                <Input label="Company Code or Invite Link" placeholder="e.g. SP-8492-X" required />
              </div>
              <div className={styles.divider} style={{ gridColumn: 'span 2' }}>OR</div>
              <div className={styles.fullWidth} style={{textAlign: 'center'}}>
                <Button variant="secondary" fullWidth>Scan QR Code</Button>
              </div>
            </div>
            <div className={styles.buttonGroup}>
              <Button onClick={nextStep}>Validate Invitation</Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className={styles.wizardContainer}>
            <Button variant="secondary" onClick={prevStep} style={{marginBottom: '1rem', padding: '0.5rem'}}><ArrowLeft size={16}/></Button>
            {renderProgress()}
            <div className={styles.header}>
              <h2>Invitation Validated</h2>
              <p>You have been invited to join an organization</p>
            </div>
            
            <div className={styles.choiceCard} style={{ cursor: 'default', margin: '1rem 0' }}>
              <div className={styles.iconWrapper}><Building2 size={48} color="var(--primary)" /></div>
              <div className={styles.choiceTitle}>ABC Supermarket</div>
              <div className={styles.choiceDesc} style={{marginBottom: '0.5rem'}}>Retail &bull; Nairobi, Kenya</div>
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 500 }}>
                Role: HR Manager
              </div>
            </div>

            <div className={styles.buttonGroup} style={{justifyContent: 'center'}}>
              <Button onClick={nextStep} fullWidth>Accept Invitation</Button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className={styles.wizardContainer}>
            <Button variant="secondary" onClick={prevStep} style={{marginBottom: '1rem', padding: '0.5rem'}}><ArrowLeft size={16}/></Button>
            {renderProgress()}
            <div className={styles.header}>
              <h2>Personal Information</h2>
              <p>Complete your profile to join ABC Supermarket</p>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.fullWidth}>
                <Input label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              <Input label="Phone Number" placeholder="+254..." />
              
              <div className={styles.fullWidth}>
                <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className={styles.fullWidth}>
                <Input label="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
            </div>
            <div className={styles.buttonGroup}>
              <Button onClick={nextStep} disabled={!password || password !== confirmPassword}>Continue</Button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className={`animate-slide-up ${styles.wizardContainer}`}>
            <Button variant="secondary" onClick={prevStep} style={{marginBottom: '1rem', padding: '0.5rem'}}><ArrowLeft size={16}/></Button>
            {renderProgress()}
            <div className={styles.header}>
              <h2>Verify Your Email</h2>
              <p>We sent a six-digit code to <strong>{email || 'your email'}</strong></p>
            </div>
            
            <div className={styles.otpContainer}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  className={styles.otpInput}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                />
              ))}
            </div>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <a href="#" className={styles.choiceDesc} style={{color: 'var(--primary)', textDecoration: 'underline'}}>Resend Code</a>
            </div>

            <div className={styles.buttonGroup} style={{justifyContent: 'center', flexDirection: 'column', gap: '1rem', width: '100%'}}>
              {error && <div className={styles.globalError} style={{color: 'var(--danger)', fontSize: '0.875rem', textAlign: 'center'}}>{error}</div>}
              <Button onClick={() => submitRegistration(true)} fullWidth disabled={otp.join('').length !== 6 || isLoading}>
                {isLoading ? 'Joining Company...' : 'Verify'}
              </Button>
            </div>
          </div>
        );
      case 6: // Success
        return (
          <div className={styles.wizardContainer} style={{textAlign: 'center', padding: '4rem 2rem'}}>
            <div className={styles.successIcon}>
              <CheckCircle2 size={48} />
            </div>
            <div className={styles.header}>
              <h2>Welcome to ABC Supermarket!</h2>
              <p className={styles.choiceDesc}>Your account has been activated successfully.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '0 auto' }}>
              <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.logo} onClick={() => router.push('/')}>SmartPay.</div>
      
      {flow === 'CHOICE' && renderChoice()}
      {flow === 'CREATE_COMPANY' && renderCreateCompanySteps()}
      {flow === 'JOIN_COMPANY' && renderJoinCompanySteps()}
    </div>
  );
}
