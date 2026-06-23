"use client";

import React, { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import DashboardView from '@/components/DashboardView';

export default function DashboardPage() {
  const { user } = useAuth();
  
  // DashboardView expects these props, though in Next.js App Router 
  // you might want to handle tabs via URL, for now we pass state.
  const [currentTab, setCurrentTab] = useState('overview');
  
  const userAny = user as any;

  return (
    <div className="animate-slide-up">
      <DashboardView 
        setCurrentTab={setCurrentTab} 
        selectedBranchId={userAny?.branch?.id || null} 
      />
    </div>
  );
}
