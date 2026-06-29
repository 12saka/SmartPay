"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, FileText, Settings,
  Wallet, PieChart, ShieldCheck, CalendarCheck, FileSpreadsheet,
  Search, ArrowRight, Command, Hash,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────
interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  group: string;
  href?: string;
  action?: () => void;
  keywords?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Command Registry ───────────────────────────────────────
const ALL_COMMANDS: CommandItem[] = [
  // Navigation
  { id: 'nav-dashboard', label: 'Go to Dashboard', description: 'Overview of payroll, employees and analytics', icon: <LayoutDashboard size={16} />, group: 'Navigation', href: '/dashboard', keywords: 'home main overview' },
  { id: 'nav-employees', label: 'Go to Employees', description: 'Manage staff profiles and roles', icon: <Users size={16} />, group: 'Navigation', href: '/dashboard/employees', keywords: 'staff directory team' },
  { id: 'nav-attendance', label: 'Go to Attendance & Leave', description: 'Track time off and check-ins', icon: <CalendarCheck size={16} />, group: 'Navigation', href: '/dashboard/attendance', keywords: 'leaves time off' },
  { id: 'nav-payroll', label: 'Go to Payroll', description: 'Calculate salaries and bonuses', icon: <FileSpreadsheet size={16} />, group: 'Navigation', href: '/dashboard/payroll', keywords: 'salary run payslip' },
  { id: 'nav-finance', label: 'Go to Finance & Taxes', description: 'Direct deposits and statutory filings', icon: <Wallet size={16} />, group: 'Navigation', href: '/dashboard/finance', keywords: 'money tax kra nssf nhif' },
  { id: 'nav-reports', label: 'Go to Reports', description: 'Exportable visual data summaries', icon: <PieChart size={16} />, group: 'Navigation', href: '/dashboard/reports', keywords: 'analytics charts export' },
  { id: 'nav-payslips', label: 'Go to My Payslips', description: 'View and download pay records', icon: <FileText size={16} />, group: 'Navigation', href: '/dashboard/payslips', keywords: 'payslip records history' },
  { id: 'nav-audit', label: 'Go to Audit Logs', description: 'Account changes and auth events', icon: <ShieldCheck size={16} />, group: 'Navigation', href: '/dashboard/audit', keywords: 'security logs history' },
  { id: 'nav-settings', label: 'Go to Settings', description: 'Organization rules and workflows', icon: <Settings size={16} />, group: 'Navigation', href: '/dashboard/settings', keywords: 'configure organization preferences' },
  // Quick Actions (non-navigation)
  { id: 'action-shortcut-hint', label: 'Keyboard Shortcuts', description: 'Alt+D Dashboard · Alt+E Employees · Alt+P Payroll', icon: <Hash size={16} />, group: 'Help', keywords: 'shortcuts keys alt keyboard' },
];

// ── Score a match (simple fuzzy) ──────────────────────────
function score(item: CommandItem, query: string): number {
  const q = query.toLowerCase();
  const label = item.label.toLowerCase();
  const desc = item.description.toLowerCase();
  const kw = (item.keywords ?? '').toLowerCase();
  if (label.startsWith(q)) return 3;
  if (label.includes(q)) return 2;
  if (desc.includes(q) || kw.includes(q)) return 1;
  return 0;
}

// ── CommandPalette Component ───────────────────────────────
export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query.trim()
    ? ALL_COMMANDS
        .map(c => ({ ...c, _score: score(c, query.trim()) }))
        .filter(c => c._score > 0)
        .sort((a, b) => b._score - a._score)
    : ALL_COMMANDS;

  // Group the filtered results
  const groups = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const flatList = filtered;

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const runCommand = useCallback((item: CommandItem) => {
    if (item.href) router.push(item.href);
    item.action?.();
    onClose();
  }, [router, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, flatList.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = flatList[activeIdx];
      if (item) runCommand(item);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(11,19,41,0.55)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 10000,
          animation: 'fadeIn 0.15s ease forwards',
        }}
      />

      {/* Palette Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        style={{
          position: 'fixed',
          top: '12vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(640px, calc(100vw - 2rem))',
          zIndex: 10001,
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(16,185,129,0.15)',
          overflow: 'hidden',
          animation: 'cmdPaletteIn 0.25s cubic-bezier(0.16,1,0.3,1) forwards',
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Search Input Row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #E2E8F0',
          flexShrink: 0,
        }}>
          <Search size={18} color="#94A3B8" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, actions, shortcuts…"
            aria-label="Command search"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              fontFamily: 'inherit',
              fontWeight: 500,
              color: '#0B1329',
              background: 'transparent',
              minHeight: 'unset',
            }}
          />
          <kbd style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
            padding: '0.2rem 0.5rem',
            fontSize: '0.7rem', fontWeight: 700,
            background: '#F1F5F9', border: '1px solid #E2E8F0',
            borderRadius: '6px', color: '#64748B',
            flexShrink: 0,
          }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0.5rem 0' }}>
          {flatList.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>
              No results for <strong style={{ color: '#475569' }}>"{query}"</strong>
            </div>
          ) : (
            Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                {/* Group Label */}
                <div style={{
                  padding: '0.5rem 1.25rem 0.25rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: '#94A3B8',
                }}>
                  {group}
                </div>

                {items.map(item => {
                  const globalIdx = flatList.indexOf(item);
                  const isActive = globalIdx === activeIdx;
                  return (
                    <button
                      key={item.id}
                      onClick={() => runCommand(item)}
                      onMouseEnter={() => setActiveIdx(globalIdx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.875rem',
                        width: '100%',
                        padding: '0.625rem 1.25rem',
                        border: 'none',
                        background: isActive ? 'rgba(16,185,129,0.08)' : 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.1s',
                        minHeight: 'unset',
                      }}
                    >
                      <span style={{
                        flexShrink: 0,
                        width: 32, height: 32,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '8px',
                        background: isActive ? 'rgba(16,185,129,0.12)' : '#F8FAFC',
                        color: isActive ? '#10B981' : '#64748B',
                        border: `1px solid ${isActive ? 'rgba(16,185,129,0.2)' : '#E2E8F0'}`,
                        transition: 'all 0.15s',
                      }}>
                        {item.icon}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '0.875rem', fontWeight: 600,
                          color: isActive ? '#0B1329' : '#1E293B',
                        }}>
                          {item.label}
                        </div>
                        <div style={{
                          fontSize: '0.75rem', color: '#94A3B8',
                          marginTop: '0.1rem', whiteSpace: 'nowrap',
                          overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {item.description}
                        </div>
                      </div>
                      {isActive && <ArrowRight size={14} color="#10B981" style={{ flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '0.625rem 1.25rem',
          borderTop: '1px solid #F1F5F9',
          background: '#FAFAFA',
          flexShrink: 0,
        }}>
          {[
            ['↑↓', 'Navigate'],
            ['↵', 'Select'],
            ['Esc', 'Close'],
          ].map(([key, label]) => (
            <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: '#94A3B8' }}>
              <kbd style={{ padding: '0.15rem 0.4rem', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '4px', fontWeight: 700, color: '#475569' }}>{key}</kbd>
              <span>{label}</span>
            </span>
          ))}
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: '#CBD5E1' }}>
            <Command size={12} />
            SmartPay Command Palette
          </span>
        </div>
      </div>
    </>
  );
}
