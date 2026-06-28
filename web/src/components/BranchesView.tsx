import React, { useEffect, useState } from 'react';
import { 
  GitBranch, 
  MapPin, 
  Plus, 
  Check, 
  AlertCircle,
  XCircle
} from 'lucide-react';
import { branchService } from '../services/api';

interface BranchesViewProps {
  selectedBranchId: number | null;
  setSelectedBranchId: (id: number | null) => void;
  setCurrentTab: (tab: string) => void;
}

export default function BranchesView({
  selectedBranchId,
  setSelectedBranchId,
  setCurrentTab
}: BranchesViewProps) {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add Branch Form
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '' });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadBranches();
  }, []);

  async function loadBranches() {
    try {
      setLoading(true);
      const data = await branchService.getAll();
      setBranches(data);
    } catch (error) {
      console.error('Failed to load branches:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMsg('');
      if (!formData.name) {
        setErrorMsg('Branch name is required.');
        return;
      }
      await branchService.create(formData);
      setIsOpen(false);
      loadBranches();
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Branches Management</h1>
          <p className="text-sm text-slate-500">Add or manage regional locations and supermarket branches</p>
        </div>
        <button
          onClick={() => { setFormData({ name: '', location: '' }); setErrorMsg(''); setIsOpen(true); }}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Branch</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Branches Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading branches...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map((b) => (
            <div 
              key={b.id} 
              className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-card flex flex-col space-y-4 hover:shadow-sm hover:border-slate-200 transition-all cursor-default group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{b.name}</h3>
                  <span className="text-xs text-slate-400 block mt-0.5">ID: BR-{b.id.toString().padStart(3, '0')}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-slate-100/60">
                <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Location: {b.location || 'Not Specified'}</span>
                </div>
                <button 
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('selectedBranchId', b.id.toString());
                    }
                    setCurrentTab('branch-details');
                  }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/60 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Branch Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-slate-200 animate-fade-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Add New Branch</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Branch Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g., Westlands Retail Shop (Branch C)"
                />
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Location Details</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g., Woodvale Groove, Westlands"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 font-semibold rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
                >
                  Create Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
