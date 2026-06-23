"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Wallet, Briefcase, BarChart3 } from 'lucide-react';
import styles from './Login.module.css';

export default function LoginPage() {
  const router = useRouter();
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
      // We assume the backend is running on port 3000 or similar.
      // In production, an environment variable would be used.
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      // Store tokens and user details securely (localStorage for now, HTTP-only cookies preferred for prod)
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));

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
              Create Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
