import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertCircle, KeyRound, Mail, User, GitBranch } from 'lucide-react';
import { authService, branchService } from '../services/api';

interface LoginViewProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [branches, setBranches] = useState<any[]>([]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('MANAGER');
  const [branchId, setBranchId] = useState('');

  useEffect(() => {
    async function loadBranches() {
      try {
        const data = await branchService.getAll();
        setBranches(data);
      } catch (err) {
        console.warn('Could not fetch branches list for registration.');
      }
    }
    loadBranches();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg('');

      if (isSignUp) {
        // Run registration
        const data = await authService.register({
          email,
          password,
          name,
          role,
          branchId: branchId ? parseInt(branchId) : null
        });
        onLoginSuccess(data.user);
      } else {
        // Run login
        const data = await authService.login({ email, password });
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify entries.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(prev => !prev);
    setErrorMsg('');
    setEmail('');
    setPassword('');
    setName('');
    setRole('MANAGER');
    setBranchId('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      {/* Brand Header */}
      <div className="mb-8 flex items-center space-x-2.5">
        <div className="bg-emerald-600 p-2 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/35">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </div>
        <div className="text-2xl font-bold tracking-tight text-white">
          smart<span className="text-emerald-500 font-extrabold ml-0.5">Pay</span>
        </div>
      </div>

      {/* Auth Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-8 shadow-2xl flex flex-col space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-white">
            {isSignUp ? 'Create Manager Account' : 'Manager Portal'}
          </h2>
          <span className="text-xs text-slate-500 block">
            {isSignUp ? 'Sign up to register your organization' : 'Sign in to approve payroll and process bulk salaries'}
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/40 border border-rose-900 text-rose-400 rounded-lg text-xs font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name (Sign Up only) */}
          {isSignUp && (
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm pl-9 pr-4 py-2 border border-slate-800 rounded-lg bg-slate-950 text-white outline-none focus:border-emerald-500 transition-colors"
                  placeholder="James Smith"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm pl-9 pr-4 py-2 border border-slate-800 rounded-lg bg-slate-950 text-white outline-none focus:border-emerald-500 transition-colors"
                placeholder="manager@smartpay.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm pl-9 pr-4 py-2 border border-slate-800 rounded-lg bg-slate-950 text-white outline-none focus:border-emerald-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Role & Branch (Sign Up only) */}
          {isSignUp && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">User Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-sm border border-slate-800 rounded-lg p-2 bg-slate-950 text-white outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="MANAGER">Manager</option>
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="EMPLOYEE">Employee</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Assigned Branch</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full text-sm border border-slate-800 rounded-lg p-2 bg-slate-950 text-white outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="">No branch (HQ)</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-2.5 px-4 rounded-lg shadow-md transition-colors text-sm flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{isSignUp ? 'Creating account...' : 'Signing in...'}</span>
              </>
            ) : (
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>
        </form>

        {/* Toggle Switch */}
        <div className="text-center">
          <button 
            type="button" 
            onClick={toggleMode} 
            className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        {/* Demo info (Login mode only) */}
        {!isSignUp && (
          <div className="border-t border-slate-800 pt-4 flex flex-col space-y-2 text-[10px] text-slate-500 font-medium">
            <div className="flex justify-between">
              <span>Demo Manager login:</span>
              <span className="font-bold text-slate-300 font-mono">manager@smartpay.com / password123</span>
            </div>
            <div className="flex justify-between">
              <span>Demo Accountant login:</span>
              <span className="font-bold text-slate-300 font-mono">accountant@smartpay.com / password123</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
