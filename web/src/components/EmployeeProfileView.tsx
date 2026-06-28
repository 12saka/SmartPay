import React, { useState, useEffect } from 'react';

interface EmployeeProfileViewProps {
  employee: any;
  onBack: () => void;
  onEdit: () => void;
  onToggleStatus: (id: number, currentStatus: string) => Promise<void>;
  branches: any[];
  successToast: (title: string, message: string) => void;
  errorToast: (title: string, message: string) => void;
}

export default function EmployeeProfileView({
  employee,
  onBack,
  onEdit,
  onToggleStatus,
  branches,
  successToast,
  errorToast
}: EmployeeProfileViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentEmp, setCurrentEmp] = useState(employee);

  // Manager Notes state loaded from localStorage
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Identity Verification State
  const [identityVerified, setIdentityVerified] = useState(false);

  // Document states
  const [docsStatus, setDocsStatus] = useState<Record<string, string>>({
    idFront: 'PENDING REVIEW',
    idBack: 'PENDING REVIEW',
    kraCert: 'PENDING REVIEW',
    contract: 'PENDING REVIEW',
    academic: 'PENDING REVIEW'
  });

  // Action Panel Inline Forms
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(currentEmp.branchId?.toString() || '');
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [newTitle, setNewTitle] = useState(currentEmp.position || '');
  const [newSalary, setNewSalary] = useState(currentEmp.salary?.toString() || '');
  const [showSendNotification, setShowSendNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Performance Reviews State
  const [performanceReviews, setPerformanceReviews] = useState([
    { date: '2026-05-15', reviewer: 'John Miller (Manager)', score: '9.0/10', comment: 'Consistently meets targets and maintains accurate register balances. Promoted to Senior Cashier.' },
    { date: '2026-03-10', reviewer: 'Jane Doe (CEO)', score: '8.8/10', comment: 'Great customer service and speed at checkout. Excellent teamwork.' }
  ]);
  const [newScore, setNewScore] = useState('9.0');
  const [newComment, setNewComment] = useState('');
  const [showAddReview, setShowAddReview] = useState(false);

  // Load local state & storage on mount
  useEffect(() => {
    setCurrentEmp(employee);
    setSelectedBranch(employee.branchId?.toString() || '');
    setNewTitle(employee.position || '');
    setNewSalary(employee.salary?.toString() || '');

    if (typeof window !== 'undefined') {
      const storedNotes = localStorage.getItem(`managerNotes_${employee.id}`);
      if (storedNotes) setNotes(storedNotes);

      const storedVerification = localStorage.getItem(`idVerified_${employee.id}`) === 'true';
      setIdentityVerified(storedVerification);

      const storedDocs = localStorage.getItem(`docsStatus_${employee.id}`);
      if (storedDocs) {
        try {
          setDocsStatus(JSON.parse(storedDocs));
        } catch (e) {}
      }
    }
  }, [employee]);

  // Handle Note Save
  const handleSaveNotes = () => {
    setIsSavingNotes(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`managerNotes_${currentEmp.id}`, notes);
    }
    setTimeout(() => {
      setIsSavingNotes(false);
      successToast('Notes Saved', 'Internal manager notes updated successfully.');
    }, 500);
  };

  // Handle Identity Verification
  const handleVerifyIdentity = () => {
    const nextState = !identityVerified;
    setIdentityVerified(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`idVerified_${currentEmp.id}`, String(nextState));
    }
    successToast(
      nextState ? 'Identity Verified' : 'Verification Revoked',
      nextState ? 'Employee identity has been officially verified.' : 'Verification status cleared.'
    );
  };

  // Handle Document verification
  const handleVerifyDoc = (docKey: string, status: 'VERIFIED' | 'REJECTED') => {
    const updated = { ...docsStatus, [docKey]: status };
    setDocsStatus(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`docsStatus_${currentEmp.id}`, JSON.stringify(updated));
    }
    successToast(
      'Document Status Updated',
      `Document marked as ${status.toLowerCase()} successfully.`
    );
  };

  // Quick Action: Update Employee position or salary
  const handleUpdateEmployment = async (fields: any) => {
    try {
      const payload = {
        fullName: currentEmp.fullName,
        nationalId: currentEmp.nationalId,
        phone: currentEmp.phone,
        email: currentEmp.email,
        department: currentEmp.department,
        position: currentEmp.position,
        salary: currentEmp.salary,
        paymentMethod: currentEmp.paymentMethod,
        accountNumber: currentEmp.accountNumber,
        taxPin: currentEmp.taxPin,
        branchId: currentEmp.branchId,
        ...fields
      };

      // Import service here or mock update in state
      const { employeeService } = await import('../services/api');
      const updated = await employeeService.update(currentEmp.id, payload);
      setCurrentEmp(updated);
      successToast('Roster Updated', 'Employment parameters synchronized successfully.');
    } catch (err) {
      // Fallback state update if backend is mock or offline
      console.warn('Could not complete API request, simulating local update.', err);
      const simulated = { ...currentEmp, ...fields };
      setCurrentEmp(simulated);
      successToast('Simulated Update', 'Local employee record refreshed.');
    }
  };

  // Handle Branch Transfer
  const handleTransferBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const branchIdVal = selectedBranch ? parseInt(selectedBranch) : null;
    handleUpdateEmployment({ branchId: branchIdVal });
    setShowTransferForm(false);
  };

  // Handle Promotion
  const handlePromotionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdateEmployment({ 
      position: newTitle, 
      salary: parseFloat(newSalary) || 0 
    });
    setShowPromotionForm(false);
  };

  // Handle Status Toggle
  const handleStatusToggle = async () => {
    try {
      await onToggleStatus(currentEmp.id, currentEmp.status);
      const nextStatus = currentEmp.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      setCurrentEmp((prev: any) => ({ ...prev, status: nextStatus }));
    } catch (e) {
      errorToast('Status Error', 'Could not modify account active state.');
    }
  };

  // Handle Notification simulation
  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationMsg.trim()) return;
    successToast('Alert Dispatched', `SMS notification delivered to ${currentEmp.phone}`);
    setNotificationMsg('');
    setShowSendNotification(false);
  };

  // Handle Add Performance Review
  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const review = {
      date: new Date().toISOString().split('T')[0],
      reviewer: 'John Miller (Manager)',
      score: `${newScore}/10`,
      comment: newComment
    };
    setPerformanceReviews([review, ...performanceReviews]);
    setNewComment('');
    setShowAddReview(false);
    successToast('Review Added', 'Performance score index updated.');
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'EM';
  };

  const yearsInService = () => {
    return '2 years, 5 months';
  };

  const activeBranchName = branches.find(b => b.id === currentEmp.branchId)?.name || 'SuperMart HQ (All)';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back navigation */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <button 
          onClick={onBack}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          ← Back to Employee Roster List
        </button>
        <span className="text-xs font-bold text-slate-400">
          Viewing Employee Profile Details
        </span>
      </div>

      {/* Suspension alert banner details sign */}
      {currentEmp.status !== 'ACTIVE' && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-semibold flex items-start space-x-3.5 animate-slide-up">
          <span className="text-sm">⚠️</span>
          <div>
            <strong className="block font-bold">Employee Account Suspended</strong>
            <span className="block mt-1 leading-relaxed text-rose-700/90 font-medium">
              This employee account status is currently set to suspended. Mobile portal log-ins, biometric scanner checks, and bulk salary payouts are currently frozen.
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Column */}
        <div className="flex-1 space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 border border-slate-200/80 rounded-2xl shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center font-extrabold text-2xl shrink-0">
                {getInitials(currentEmp.fullName)}
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl font-bold text-slate-900 leading-tight">{currentEmp.fullName}</h1>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    currentEmp.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {currentEmp.status}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-semibold block mt-1">
                  {currentEmp.employeeNumber} • {currentEmp.position} • {currentEmp.department}
                </span>
                <span className="text-xs text-slate-400 font-bold block mt-1">
                  Assigned Branch: {activeBranchName}
                </span>
              </div>
            </div>

            {/* Quick Contact buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <a 
                href={`tel:${currentEmp.phone}`} 
                className="bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-bold py-2 px-3 rounded-lg transition-all"
              >
                Call Phone
              </a>
              <a 
                href={`mailto:${currentEmp.email}`} 
                className="bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-bold py-2 px-3 rounded-lg transition-all"
              >
                Send Email
              </a>
              <button 
                onClick={() => successToast('Print Initiated', 'Employee security credentials card sent to spooler.')}
                className="bg-[var(--brand-green)] hover:bg-[#0c8a50] text-white text-xs font-bold py-2 px-3 rounded-lg transition-all"
              >
                Print Card
              </button>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="border-b border-slate-200 flex flex-wrap gap-1">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'personal', label: 'Personal Info' },
              { id: 'employment', label: 'Employment' },
              { id: 'payroll', label: 'Payroll' },
              { id: 'documents', label: 'Documents' },
              { id: 'attendance', label: 'Attendance' },
              { id: 'performance', label: 'Performance' },
              { id: 'activity', label: 'Activity Log' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? 'border-emerald-600 text-emerald-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Tab Panel */}
          <div className="bg-white p-6 border border-slate-200/80 rounded-2xl shadow-card">
            
            {/* 1. Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Health Indicators */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Profile Completeness</span>
                    <span className="text-lg font-bold text-slate-800 block mt-1">98%</span>
                    <span className="text-[9px] text-emerald-600 font-semibold block mt-0.5">Contact info complete</span>
                  </div>
                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Document Verification</span>
                    <span className="text-lg font-bold text-slate-800 block mt-1">
                      {Object.values(docsStatus).filter(s => s === 'VERIFIED').length} / 5 Checked
                    </span>
                    <span className="text-[9px] text-amber-600 font-semibold block mt-0.5">Identity records under review</span>
                  </div>
                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Attendance Rate</span>
                    <span className="text-lg font-bold text-slate-800 block mt-1">96.4%</span>
                    <span className="text-[9px] text-emerald-600 font-semibold block mt-0.5">Average clock-in 8:02 AM</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {/* Account Verification checklist */}
                  <div className="border border-slate-100 p-4 rounded-xl space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2">Verification Checklist</h3>
                    <div className="space-y-2 text-xs font-semibold text-slate-600">
                      <div className="flex items-center space-x-2">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>Email address verified</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>Phone number verified</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={identityVerified ? 'text-emerald-600 font-bold' : 'text-amber-500 font-bold'}>
                          {identityVerified ? '✓' : '⚠'}
                        </span>
                        <span>{identityVerified ? 'National ID verified' : 'National ID review required'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-amber-500 font-bold">⚠</span>
                        <span>Missing official NHIF card scan (Optional)</span>
                      </div>
                    </div>
                  </div>

                  {/* Security Profile completeness */}
                  <div className="border border-slate-100 p-4 rounded-xl space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2">Portal Security Details</h3>
                    <div className="space-y-2 text-xs text-slate-500 font-semibold">
                      <div className="flex justify-between">
                        <span>Digital Signature status:</span>
                        <span className="text-slate-800 font-bold">REGISTERED</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Two-factor Auth:</span>
                        <span className="text-slate-800 font-bold">ENFORCED (SMS)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last login timestamp:</span>
                        <span className="text-slate-800 font-bold">2026-06-27, 08:14 AM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Portal device:</span>
                        <span className="text-slate-800 font-bold">Android / Chrome Mobile</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Manager Notes section */}
                <div className="border border-slate-200 p-4 rounded-xl space-y-3 bg-amber-50/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-slate-800">Internal Manager Notes</h3>
                    <span className="text-[10px] text-slate-400 font-bold">Visible to management only</span>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Add logs, promotion records, warning notes or comments about this employee..."
                    className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNotes}
                      disabled={isSavingNotes}
                      className="bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-all"
                    >
                      {isSavingNotes ? 'Saving...' : 'Save Notes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Personal Info Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs font-semibold">
                  <div className="border-b border-slate-50 pb-2">
                    <span className="text-slate-400 block mb-0.5">Full Name</span>
                    <span className="text-slate-800 block">{currentEmp.fullName}</span>
                  </div>
                  <div className="border-b border-slate-50 pb-2">
                    <span className="text-slate-400 block mb-0.5">Gender</span>
                    <span className="text-slate-800 block">Male</span>
                  </div>
                  <div className="border-b border-slate-50 pb-2">
                    <span className="text-slate-400 block mb-0.5">Date of Birth</span>
                    <span className="text-slate-800 block">15 June 1996</span>
                  </div>
                  <div className="border-b border-slate-50 pb-2">
                    <span className="text-slate-400 block mb-0.5">Nationality</span>
                    <span className="text-slate-800 block">Kenyan</span>
                  </div>
                  <div className="border-b border-slate-50 pb-2">
                    <span className="text-slate-400 block mb-0.5">Marital Status</span>
                    <span className="text-slate-800 block">Married</span>
                  </div>
                  <div className="border-b border-slate-50 pb-2">
                    <span className="text-slate-400 block mb-0.5">National ID / Passport Number</span>
                    <span className="text-slate-800 block font-mono">{currentEmp.nationalId}</span>
                  </div>
                  <div className="border-b border-slate-50 pb-2">
                    <span className="text-slate-400 block mb-0.5">KRA Tax PIN</span>
                    <span className="text-slate-800 block font-mono">{currentEmp.taxPin}</span>
                  </div>
                  <div className="border-b border-slate-50 pb-2">
                    <span className="text-slate-400 block mb-0.5">Home Address</span>
                    <span className="text-slate-800 block">Suite 12, Sunrise Apts, South C, Nairobi</span>
                  </div>
                  <div className="border-b border-slate-50 pb-2">
                    <span className="text-slate-400 block mb-0.5">Emergency Contact Number</span>
                    <span className="text-slate-800 block font-mono">0722 000 111</span>
                  </div>
                  <div className="border-b border-slate-50 pb-2">
                    <span className="text-slate-400 block mb-0.5">Next of Kin & Relationship</span>
                    <span className="text-slate-800 block">Mary Wambui (Spouse)</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 justify-end">
                  <button 
                    onClick={handleVerifyIdentity}
                    className={`text-xs font-bold py-2 px-4 rounded-lg border transition-all ${
                      identityVerified 
                        ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100' 
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {identityVerified ? 'Revoke Verification' : 'Verify Identity'}
                  </button>
                  <button 
                    onClick={() => successToast('Export Successful', 'Employee profile PDF downloaded.')}
                    className="bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold py-2 px-4 rounded-lg transition-all"
                  >
                    Download Profile PDF
                  </button>
                </div>
              </div>
            )}

            {/* 3. Employment Tab */}
            {activeTab === 'employment' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs font-semibold">
                  <div className="border-b border-slate-50 pb-2">
                    <span className="text-slate-400 block mb-0.5">Assigned Department</span>
                    <span className="text-slate-800 block">{currentEmp.department}</span>
                  </div>
                  <div className="border-b border-slate-50 pb-2">
                    <span className="text-slate-400 block mb-0.5">Job Title / Position</span>
                    <span className="text-slate-800 block">{currentEmp.position}</span>
                  </div>
                  <div className="border-b border-slate-50 pb-2">
                    <span className="text-slate-400 block mb-0.5">Employment Type</span>
                    <span className="text-slate-800 block">Permanent (Full Time)</span>
                  </div>
                  <div className="border-b border-slate-50 pb-2">
                    <span className="text-slate-400 block mb-0.5">Reporting Line Manager</span>
                    <span className="text-slate-800 block">John Miller (Branch Manager)</span>
                  </div>
                  <div className="border-b border-slate-50 pb-2">
                    <span className="text-slate-400 block mb-0.5">Shift Configuration</span>
                    <span className="text-slate-800 block">Morning Shift (08:00 AM - 05:00 PM)</span>
                  </div>
                  <div className="border-b border-slate-50 pb-2">
                    <span className="text-slate-400 block mb-0.5">Active Branch Assignment</span>
                    <span className="text-slate-800 block">{activeBranchName}</span>
                  </div>
                  <div className="border-b border-slate-50 pb-2">
                    <span className="text-slate-400 block mb-0.5">Contract Start Date</span>
                    <span className="text-slate-800 block">12 January 2024</span>
                  </div>
                  <div className="border-b border-slate-50 pb-2">
                    <span className="text-slate-400 block mb-0.5">Contract Tenure</span>
                    <span className="text-slate-800 block">Ongoing (No fixed end date)</span>
                  </div>
                  <div className="border-b border-slate-50 pb-2">
                    <span className="text-slate-400 block mb-0.5">Years in Service</span>
                    <span className="text-slate-800 block">{yearsInService()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Payroll Tab */}
            {activeTab === 'payroll' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Salary breakdown card */}
                  <div className="border border-slate-100 p-4 rounded-xl space-y-3 bg-slate-50/30">
                    <h3 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2">Salary Allocation Structure</h3>
                    <div className="space-y-2 text-xs font-semibold text-slate-600">
                      <div className="flex justify-between">
                        <span>Basic Salary:</span>
                        <span className="text-slate-850 font-bold">KES {currentEmp.salary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600">
                        <span>Housing Allowance:</span>
                        <span>+ KES 5,000</span>
                      </div>
                      <div className="flex justify-between text-emerald-600">
                        <span>Transport Allowance:</span>
                        <span>+ KES 3,000</span>
                      </div>
                      <div className="flex justify-between text-rose-600 border-b border-slate-100 pb-2">
                        <span>PAYE Tax / Statutory Deductions:</span>
                        <span>- KES 4,500</span>
                      </div>
                      <div className="flex justify-between text-slate-850 font-extrabold text-sm pt-1">
                        <span>Net Monthly Salary:</span>
                        <span>KES {(currentEmp.salary + 8000 - 4500).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details card */}
                  <div className="border border-slate-100 p-4 rounded-xl space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 border-b border-slate-50 pb-2">Payout Configuration</h3>
                    <div className="space-y-2 text-xs font-semibold text-slate-500">
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span className="text-slate-850 font-bold">{currentEmp.paymentMethod === 'MPESA' ? 'M-Pesa B2C Mobile Payout' : 'Bank EFT Transfer'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Destination Details:</span>
                        <span className="text-slate-850 font-mono font-bold">{currentEmp.accountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax Identification PIN:</span>
                        <span className="text-slate-850 font-mono">{currentEmp.taxPin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payout Cycle:</span>
                        <span className="text-slate-850">Monthly (Every 28th)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Historical Payslips List */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-800">Historical Payslips</h3>
                  <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                    {[
                      { period: 'May 2026', paidOn: '25 May 2026', net: (currentEmp.salary + 8000 - 4500) },
                      { period: 'April 2026', paidOn: '25 April 2026', net: (currentEmp.salary + 8000 - 4500) },
                      { period: 'March 2026', paidOn: '25 March 2026', net: (currentEmp.salary + 8000 - 4500) }
                    ].map((ps, idx) => (
                      <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
                        <div>
                          <span className="text-slate-800 font-bold block">{ps.period} Payslip</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Paid on {ps.paidOn}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-slate-800 font-bold">KES {ps.net.toLocaleString()}</span>
                          <button 
                            onClick={() => successToast('PDF Generated', `Payslip for ${ps.period} downloaded.`)}
                            className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold border border-emerald-100 hover:border-emerald-200 bg-emerald-50/35 px-2 py-1 rounded"
                          >
                            Download PDF
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-800 mb-2 border-b border-slate-50 pb-2">Uploaded Document Checks</h3>
                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                  {[
                    { key: 'idFront', label: 'National ID (Front)', file: 'ID_Front_Scan.jpg' },
                    { key: 'idBack', label: 'National ID (Back)', file: 'ID_Back_Scan.jpg' },
                    { key: 'kraCert', label: 'KRA Certificate PIN Roll', file: 'KRA_PIN_TaxPin_P05.pdf' },
                    { key: 'contract', label: 'Signed Employment Contract', file: 'Employment_Contract_Signed_David.pdf' },
                    { key: 'academic', label: 'Academic Certificates (Diploma)', file: 'KCSE_Diploma_Certificates_Bundled.pdf' }
                  ].map((doc) => {
                    const status = docsStatus[doc.key] || 'PENDING REVIEW';
                    return (
                      <div key={doc.key} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/50">
                        <div>
                          <span className="text-slate-800 font-bold block">{doc.label}</span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{doc.file}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full mt-1.5 inline-block ${
                            status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                            status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0">
                          <button 
                            onClick={() => successToast('Document Open', `Displaying preview of ${doc.file}`)}
                            className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold px-2.5 py-1 rounded text-[10px]"
                          >
                            Preview File
                          </button>
                          {status !== 'VERIFIED' && (
                            <button 
                              onClick={() => handleVerifyDoc(doc.key, 'VERIFIED')}
                              className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold px-2.5 py-1 rounded text-[10px] hover:bg-emerald-100"
                            >
                              Verify
                            </button>
                          )}
                          {status !== 'REJECTED' && (
                            <button 
                              onClick={() => handleVerifyDoc(doc.key, 'REJECTED')}
                              className="bg-rose-50 border border-rose-200 text-rose-700 font-bold px-2.5 py-1 rounded text-[10px] hover:bg-rose-100"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. Attendance Tab */}
            {activeTab === 'attendance' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl text-center">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Attendance Rate</span>
                    <span className="text-xl font-bold text-slate-800 block mt-1">96.4%</span>
                  </div>
                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl text-center">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Days Worked</span>
                    <span className="text-xl font-bold text-slate-800 block mt-1">21 / 22 days</span>
                  </div>
                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl text-center">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Late Arrivals</span>
                    <span className="text-xl font-bold text-rose-600 block mt-1">1 Day</span>
                  </div>
                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl text-center">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Leave Balance</span>
                    <span className="text-xl font-bold text-slate-800 block mt-1">14 days</span>
                  </div>
                </div>

                {/* Recent Shift logs */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800">Historical Attendance Logs (Active Period)</h3>
                    <button 
                      onClick={() => successToast('Export Logs', 'Attendance ledger sheet exported.')}
                      className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold"
                    >
                      Export Logs
                    </button>
                  </div>
                  <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="p-3">Date</th>
                          <th className="p-3">Shift</th>
                          <th className="p-3 text-center">Clock-In</th>
                          <th className="p-3 text-center">Clock-Out</th>
                          <th className="p-3 text-center">Overtime</th>
                          <th className="p-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                        {[
                          { date: '2026-06-26', shift: 'Morning', in: '08:01 AM', out: '05:00 PM', overtime: '—', status: 'Present' },
                          { date: '2026-06-25', shift: 'Morning', in: '07:58 AM', out: '06:30 PM', overtime: '1.5 hrs', status: 'Present' },
                          { date: '2026-06-24', shift: 'Morning', in: '08:02 AM', out: '05:00 PM', overtime: '—', status: 'Present' },
                          { date: '2026-06-23', shift: 'Morning', in: '08:15 AM', out: '05:00 PM', overtime: '—', status: 'Late Arrival' },
                          { date: '2026-06-22', shift: 'Morning', in: '—', out: '—', overtime: '—', status: 'Leave Day' },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3 font-mono">{row.date}</td>
                            <td className="p-3">{row.shift}</td>
                            <td className="p-3 text-center font-mono">{row.in}</td>
                            <td className="p-3 text-center font-mono">{row.out}</td>
                            <td className="p-3 text-center font-bold">{row.overtime}</td>
                            <td className="p-3 text-right">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                row.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                                row.status === 'Late Arrival' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 7. Performance Tab */}
            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50 pb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Average Performance Index</span>
                    <span className="text-2xl font-bold text-slate-800 block mt-1">8.9 / 10</span>
                  </div>
                  <button 
                    onClick={() => setShowAddReview(!showAddReview)}
                    className="bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold py-2 px-3 rounded-lg transition-all self-start sm:self-auto"
                  >
                    {showAddReview ? 'Cancel Review' : 'Add Performance Evaluation'}
                  </button>
                </div>

                {/* Inline Performance Review Form */}
                {showAddReview && (
                  <form onSubmit={handleAddReview} className="p-4 border border-slate-200 bg-slate-50/45 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Index Score (out of 10)</label>
                        <select
                          value={newScore}
                          onChange={(e) => setNewScore(e.target.value)}
                          className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 font-semibold outline-none"
                        >
                          <option value="10.0">10.0 (Outstanding)</option>
                          <option value="9.0">9.0 (Excellent)</option>
                          <option value="8.0">8.0 (Good)</option>
                          <option value="7.0">7.0 (Average)</option>
                          <option value="6.0">6.0 (Below Average)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Performance Evaluation Review</label>
                      <textarea
                        required
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        placeholder="Detail the achievements, cash register balancing compliance, or areas of improvement..."
                        className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-all"
                      >
                        Submit Evaluation
                      </button>
                    </div>
                  </form>
                )}

                {/* Historical reviews list */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-800">Historical Manager Evaluations</h3>
                  <div className="space-y-3.5">
                    {performanceReviews.map((rev, idx) => (
                      <div key={idx} className="border border-slate-100 p-4 rounded-xl space-y-2 text-xs font-semibold">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-800 font-extrabold">{rev.reviewer}</span>
                          <span className="text-[10px] text-slate-400">{rev.date}</span>
                        </div>
                        <div className="text-emerald-700 font-bold bg-emerald-50/50 inline-block px-2.5 py-0.5 rounded-full text-[10px] border border-emerald-100">
                          Score: {rev.score}
                        </div>
                        <p className="text-slate-500 leading-relaxed font-medium mt-1.5">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 8. Activity Log Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-800 mb-2 border-b border-slate-50 pb-2">Audit Trails & Profile Activities</h3>
                <div className="space-y-4 relative border-l border-slate-100 pl-4 ml-2.5 py-2 text-xs font-semibold">
                  <div className="relative">
                    <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                    <div className="text-slate-800 font-bold">Manager Notes updated</div>
                    <div className="text-[10px] text-slate-400 block mt-0.5">Updated by Admin • Today, 10:14 AM</div>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                    <div className="text-slate-800 font-bold">Salary allocation structure modified</div>
                    <div className="text-[10px] text-slate-400 block mt-0.5">Updated by Admin • Yesterday, 03:30 PM</div>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                    <div className="text-slate-800 font-bold">National ID scan front/back verified</div>
                    <div className="text-[10px] text-slate-400 block mt-0.5">Verified by John Miller (Manager) • 2 weeks ago</div>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white"></span>
                    <div className="text-slate-800 font-bold">Employee profile credentials initialized</div>
                    <div className="text-[10px] text-slate-400 block mt-0.5">System Gate Callback • 1 month ago</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Quick Actions Column */}
        <div className="w-full lg:w-72 shrink-0 space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-slate-900 text-slate-300 p-5 rounded-2xl border border-slate-850 shadow-xl flex flex-col space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">Admin Quick Actions</h2>

            {/* Actions list */}
            <div className="space-y-2 text-xs font-bold">
              {/* Edit Details */}
              <button 
                onClick={onEdit}
                className="w-full text-left px-3 py-2 bg-slate-800/40 hover:bg-slate-850 text-white rounded-lg transition-colors border border-slate-800"
              >
                ✏ Edit Personal Details
              </button>

              {/* Transfer Branch */}
              <button 
                onClick={() => { setShowTransferForm(!showTransferForm); setShowPromotionForm(false); setShowSendNotification(false); }}
                className="w-full text-left px-3 py-2 bg-slate-800/40 hover:bg-slate-850 text-white rounded-lg transition-colors border border-slate-800"
              >
                🔄 Transfer Branch Assignment
              </button>

              {showTransferForm && (
                <form onSubmit={handleTransferBranchSubmit} className="p-3 bg-slate-850 rounded-lg border border-slate-800 space-y-2 mt-1 animate-slide-up text-slate-300">
                  <label className="text-[10px] text-slate-400 block font-bold">Select Destination Branch</label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded p-1.5 font-semibold focus:outline-none"
                  >
                    <option value="">No branch (HQ)</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <div className="flex justify-end space-x-1.5 pt-1">
                    <button 
                      type="button" 
                      onClick={() => setShowTransferForm(false)} 
                      className="bg-slate-800 text-[10px] text-slate-300 px-2 py-1 rounded hover:bg-slate-750 font-bold"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-emerald-600 text-[10px] text-white px-2.5 py-1 rounded hover:bg-emerald-700 font-bold"
                    >
                      Transfer
                    </button>
                  </div>
                </form>
              )}

              {/* Promote Employee */}
              <button 
                onClick={() => { setShowPromotionForm(!showPromotionForm); setShowTransferForm(false); setShowSendNotification(false); }}
                className="w-full text-left px-3 py-2 bg-slate-800/40 hover:bg-slate-850 text-white rounded-lg transition-colors border border-slate-800"
              >
                ⬆ Promote / Adjust Salary
              </button>

              {showPromotionForm && (
                <form onSubmit={handlePromotionSubmit} className="p-3 bg-slate-850 rounded-lg border border-slate-800 space-y-3.5 mt-1 animate-slide-up text-slate-300">
                  <div>
                    <label className="text-[10px] text-slate-400 block font-bold mb-1">New Job Title</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded p-1.5 font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block font-bold mb-1">New Monthly Salary (KES)</label>
                    <input
                      type="number"
                      required
                      value={newSalary}
                      onChange={(e) => setNewSalary(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded p-1.5 font-semibold focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end space-x-1.5 pt-1">
                    <button 
                      type="button" 
                      onClick={() => setShowPromotionForm(false)} 
                      className="bg-slate-800 text-[10px] text-slate-300 px-2 py-1 rounded hover:bg-slate-750 font-bold"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-emerald-600 text-[10px] text-white px-2.5 py-1 rounded hover:bg-emerald-700 font-bold"
                    >
                      Save Promotion
                    </button>
                  </div>
                </form>
              )}

              {/* Send Notification */}
              <button 
                onClick={() => { setShowSendNotification(!showSendNotification); setShowTransferForm(false); setShowPromotionForm(false); }}
                className="w-full text-left px-3 py-2 bg-slate-800/40 hover:bg-slate-850 text-white rounded-lg transition-colors border border-slate-800"
              >
                📨 Send Portal Notice
              </button>

              {showSendNotification && (
                <form onSubmit={handleSendNotification} className="p-3 bg-slate-850 rounded-lg border border-slate-800 space-y-2 mt-1 animate-slide-up text-slate-300">
                  <label className="text-[10px] text-slate-400 block font-bold">SMS / Email Message</label>
                  <textarea
                    required
                    value={notificationMsg}
                    onChange={(e) => setNotificationMsg(e.target.value)}
                    rows={2}
                    placeholder="e.g. Please upload your NHIF card scan before the payroll run..."
                    className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded p-1.5 font-medium focus:outline-none"
                  />
                  <div className="flex justify-end space-x-1.5 pt-1">
                    <button 
                      type="button" 
                      onClick={() => setShowSendNotification(false)} 
                      className="bg-slate-800 text-[10px] text-slate-300 px-2 py-1 rounded hover:bg-slate-750 font-bold"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-emerald-600 text-[10px] text-white px-2.5 py-1 rounded hover:bg-emerald-700 font-bold"
                    >
                      Dispatch
                    </button>
                  </div>
                </form>
              )}

              {/* Suspend Employee */}
              <button 
                onClick={handleStatusToggle}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors border ${
                  currentEmp.status === 'ACTIVE'
                    ? 'bg-amber-950/20 hover:bg-amber-950/40 border-amber-900/60 text-amber-400'
                    : 'bg-emerald-950/20 hover:bg-emerald-950/40 border-emerald-900/60 text-emerald-400'
                }`}
              >
                🔒 {currentEmp.status === 'ACTIVE' ? 'Suspend Employee Access' : 'Reactivate Employee Access'}
              </button>

              <div className="border-t border-slate-800/80 my-3 pt-3"></div>

              {/* Terminate Employment */}
              <button 
                onClick={() => {
                  const confirmTerm = confirm("Are you sure you want to officially terminate this employee's contract?");
                  if (confirmTerm) {
                    handleUpdateEmployment({ status: 'SUSPENDED', position: 'Terminated Cashier' });
                    successToast('Employment Terminated', 'Roster status set to INACTIVE / Contract Expired.');
                  }
                }}
                className="w-full text-left px-3 py-2 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/60 text-rose-400 rounded-lg transition-colors"
              >
                🚫 Terminate Employment
              </button>

              {/* Delete Employee */}
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full text-left px-3 py-2 bg-rose-950/40 hover:bg-rose-950/65 border border-rose-900 text-rose-500 rounded-lg transition-colors"
              >
                🗑 Delete Employee Record
              </button>

              {showDeleteConfirm && (
                <div className="p-3 bg-rose-950/20 border border-rose-900/60 rounded-lg space-y-2 mt-1 animate-slide-up text-xs text-rose-300">
                  <span className="font-bold block leading-relaxed">
                    Warning: Deleting will wipe this employee roster record permanently. Proceed?
                  </span>
                  <div className="flex justify-end space-x-1.5 pt-1">
                    <button 
                      type="button" 
                      onClick={() => setShowDeleteConfirm(false)} 
                      className="bg-slate-850 text-[10px] text-slate-300 px-2 py-1 rounded hover:bg-slate-800 border border-slate-800 font-bold"
                    >
                      Keep
                    </button>
                    <button 
                      type="button" 
                      onClick={async () => {
                        try {
                          const { employeeService } = await import('../services/api');
                          await employeeService.toggleStatus(currentEmp.id, 'DELETED');
                          successToast('Deleted successfully', 'Roster updated.');
                          onBack();
                        } catch (err) {
                          // Simulating deletion
                          successToast('Record Removed', 'Simulated delete from roster database.');
                          onBack();
                        }
                      }} 
                      className="bg-rose-600 text-[10px] text-white px-2.5 py-1 rounded hover:bg-rose-700 font-bold"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
