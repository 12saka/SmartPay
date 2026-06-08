import React from 'react';
import { HelpCircle, AlertCircle, FileCheck2, ShieldAlert } from 'lucide-react';

interface PlaceholderViewProps {
  title: string;
}

export default function PlaceholderView({ title }: PlaceholderViewProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center animate-fade-in">
      <div className="bg-white p-8 border border-slate-200/80 rounded-2xl shadow-card max-w-md w-full flex flex-col items-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <FileCheck2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-800">{title} Module</h2>
          <span className="text-xs text-slate-400 block font-semibold">Under Development (SME Pack)</span>
        </div>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          This feature is part of the SmartPay SME package. Database schema migrations and layouts are configured to support this module in the next phase.
        </p>
        <button className="border border-slate-200 hover:border-slate-300 text-slate-600 font-bold py-2 px-4 rounded-lg text-xs transition-colors bg-white">
          Access Documentation
        </button>
      </div>
    </div>
  );
}
