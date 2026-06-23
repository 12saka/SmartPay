"use client";

import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="animate-slide-up" style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
      <div className="glass-panel glass-card-hover stagger-1 animate-slide-up" style={{ 
        padding: '2rem', 
        borderRadius: 'var(--radius-lg)'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Welcome, {user?.name}</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          You are logged in as <strong style={{color: 'var(--accent)'}}>{user?.role}</strong>. 
          Use the sidebar to navigate to your permitted areas.
        </p>
      </div>

      {user?.role === 'MANAGER' && (
        <div className="glass-panel glass-card-hover stagger-2 animate-slide-up" style={{ 
          padding: '2rem', 
          borderRadius: 'var(--radius-lg)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Quick Actions</h2>
          <ul style={{ color: 'var(--primary)', listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li style={{cursor: 'pointer', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', transition: 'background 0.2s'}} className="hover:bg-opacity-10">+ Add New Employee</li>
            <li style={{cursor: 'pointer', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', transition: 'background 0.2s'}} className="hover:bg-opacity-10">+ Run Payroll</li>
            <li style={{cursor: 'pointer', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', transition: 'background 0.2s'}} className="hover:bg-opacity-10">+ View Reports</li>
          </ul>
        </div>
      )}
    </div>
  );
}
