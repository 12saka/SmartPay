"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Wallet, Briefcase, BarChart3 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import styles from './Login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      // Store in auth provider state and local storage
      if (data.user && data.user.status === 'SUSPENDED') {
        throw new Error('This account has been suspended. Access is restricted.');
      }
      login(data.accessToken, data.user);

      // Route based on role
      router.push('/dashboard');
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Side - Illustration */}
      <div className={styles.leftSide}>
        <div className={`${styles.floatingCard} ${styles.card1}`}>
          <Wallet size={24} color="#10B981" />
          <div>
            <div style={{ fontWeight: 600 }}>Payroll Processed</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Just now</div>
          </div>
        </div>
        
        <div className={`${styles.floatingCard} ${styles.card2}`}>
          <Briefcase size={24} color="#3b82f6" />
          <div>
            <div style={{ fontWeight: 600 }}>New Employee</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Onboarding completed</div>
          </div>
        </div>

        <div className={`${styles.floatingCard} ${styles.card3}`}>
          <BarChart3 size={24} color="#f59e0b" />
          <div>
            <div style={{ fontWeight: 600 }}>Analytics Updated</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Monthly reports ready</div>
          </div>
        </div>

        <h1 className={styles.illustrationTitle}>Welcome to SmartPay</h1>
        <p className={styles.illustrationText}>
          The enterprise-grade solution for seamless payroll management, employee onboarding, and financial analytics.
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className={styles.rightSide}>
        <div className={styles.formContainer}>
          <h2 className={styles.title}>Welcome Back</h2>
          <p className={styles.subtitle}>Sign in to access your payroll workspace.</p>

          {error && <div className={styles.globalError}>{error}</div>}

          <form className={styles.form} onSubmit={handleLogin}>
            <Input
              label="Company Email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className={styles.options}>
              <label className={styles.checkboxContainer}>
                <input type="checkbox" /> Remember Me
              </label>
              <a href="#" className={styles.forgotPassword}>Forgot Password?</a>
            </div>

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className={styles.divider}>Or continue with</div>

          <div className={styles.socialButtons}>
            <button className={styles.socialBtn} type="button">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} height={20} />
              Google
            </button>
            <button className={styles.socialBtn} type="button">
              <img src="https://www.svgrepo.com/show/475661/microsoft-color.svg" alt="Microsoft" width={20} height={20} />
              Microsoft
            </button>
          </div>

          <div className={styles.createAccountContainer}>
            <Button variant="secondary" fullWidth onClick={() => router.push('/register')}>
              Register a Company
            </Button>
          </div>

          {/* Download App Banner */}
          <div className="mt-6 p-4 border border-slate-100 bg-slate-50/60 rounded-xl flex items-center justify-between text-left animate-slide-up">
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-800 block">SmartPay Mobile App</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Access payslips & request advances on the go</span>
            </div>
            <a 
              href="/app-release.apk" 
              download
              className="px-3 py-2 bg-slate-900 hover:bg-slate-855 text-white rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1 shrink-0 cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <span>Download Client</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
