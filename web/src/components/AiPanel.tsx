import React, { useState } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles,
  TrendingUp,
  AlertTriangle,
  PieChart
} from 'lucide-react';

export default function AiPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    { sender: 'ai', text: 'Hello! I am your SmartPay AI assistant. Ask me questions like "Which branch spent the most?" or "Forecast next month\'s payroll".' }
  ]);
  const [input, setInput] = useState('');

  const quickQuestions = [
    { text: 'Which branch spent the most?', reply: 'Based on May 2026 data, Nairobi CBD Branch spent the most with KES 1.2M (49% of total payroll), followed by Nakuru at KES 840K.' },
    { text: 'Forecast next month\'s payroll.', reply: 'Projecting a 4.2% payroll growth for June 2026 due to 3 newly onboarded cashiers and scheduled supervisor increments. Estimated budget: KES 2,553,000.' },
    { text: 'Show pending salaries.', reply: 'There are currently 36 pending payments for May 2026, totaling KES 540,000. These are awaiting final finance authorization.' }
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInput('');

    setTimeout(() => {
      let reply = "I'm analyzing the database... I can answer questions about branch budgets, salary advances, overtime claims, or payroll forecasts.";
      
      const query = text.toLowerCase();
      if (query.includes('branch') || query.includes('spent the most')) {
        reply = 'Nairobi CBD Branch accounts for KES 1.2M of payroll expenses. Nakuru is second at KES 840K.';
      } else if (query.includes('forecast') || query.includes('next month')) {
        reply = 'June 2026 payroll is forecasted to rise to KES 2.55M, up 4.2% from KES 2.45M in May.';
      } else if (query.includes('pending') || query.includes('salaries') || query.includes('unpaid')) {
        reply = 'There are 36 employees with pending payments totaling KES 540,000. Under approvals, there are also 3 pending advances.';
      }

      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none">
      {/* Closed State Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold p-4 rounded-full shadow-2xl transition-all scale-hover active:scale-95"
        >
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span className="text-xs pr-1">SmartPay AI</span>
        </button>
      )}

      {/* Open State Panel */}
      {isOpen && (
        <div className="bg-slate-900 text-slate-100 rounded-2xl w-80 h-96 shadow-2xl border border-slate-800 flex flex-col justify-between overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
              <span className="text-xs font-bold">SmartPay AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* AI Insights & Quick Stats block */}
          <div className="bg-slate-950/40 p-3 border-b border-slate-800/60 text-[10px] space-y-1.5 font-semibold">
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Nairobi CBD is the highest department expense (49%)</span>
            </div>
            <div className="flex items-center space-x-1.5 text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>3 employees have unusual overtime claims this week</span>
            </div>
          </div>

          {/* Messages Logs */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs font-medium leading-relaxed ${
                  m.sender === 'user' 
                    ? 'bg-[var(--brand-green)] text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-100 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Suggested Prompts footer */}
          <div className="px-4 py-2 border-t border-slate-800/40 flex flex-wrap gap-1.5 bg-slate-950/20">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(q.text)}
                className="text-[9px] font-bold bg-slate-800/80 hover:bg-slate-800 border border-slate-700/40 text-slate-300 px-2 py-1 rounded"
              >
                {q.text}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
            className="p-3 border-t border-slate-800 bg-slate-950 flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI about payroll costs..."
              className="flex-1 bg-slate-900 border border-slate-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-slate-700 font-semibold"
            />
            <button 
              type="submit"
              className="p-2 bg-[var(--brand-green)] hover:bg-[#0c8a50] text-white rounded-lg transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
