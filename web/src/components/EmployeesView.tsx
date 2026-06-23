import React, { useEffect, useState } from 'react';
import { 
  Search, 
  UserPlus, 
  FileSpreadsheet, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { employeeService, branchService } from '../services/api';
import { Skeleton } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';
import { useToast } from '@/components/ui/ToastProvider';
import { UserPlus as UserPlusIcon } from 'lucide-react';

interface EmployeesViewProps {
  selectedBranchId: number | null;
}

export default function EmployeesView({ selectedBranchId }: EmployeesViewProps) {
  const { success, error: toastError, info } = useToast();
  const [employees, setEmployees] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    nationalId: '',
    phone: '',
    email: '',
    department: 'Sales',
    position: '',
    salary: '',
    paymentMethod: 'MPESA',
    accountNumber: '',
    taxPin: '',
    branchId: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  const departments = ['Sales', 'Cashiers', 'Warehousing', 'Administration', 'Logistics', 'Security'];

  useEffect(() => {
    loadData();
  }, [selectedBranchId]);

  async function loadData() {
    try {
      setLoading(true);
      const [empList, branchList] = await Promise.all([
        employeeService.getAll({ branchId: selectedBranchId || undefined }),
        branchService.getAll()
      ]);
      setEmployees(empList);
      setBranches(branchList);
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      nationalId: '',
      phone: '',
      email: '',
      department: 'Sales',
      position: '',
      salary: '',
      paymentMethod: 'MPESA',
      accountNumber: '',
      taxPin: '',
      branchId: selectedBranchId ? selectedBranchId.toString() : ''
    });
    setErrorMsg('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (emp: any) => {
    setEditingEmployee(emp);
    setFormData({
      fullName: emp.fullName,
      nationalId: emp.nationalId,
      phone: emp.phone,
      email: emp.email,
      department: emp.department,
      position: emp.position,
      salary: emp.salary.toString(),
      paymentMethod: emp.paymentMethod,
      accountNumber: emp.accountNumber,
      taxPin: emp.taxPin,
      branchId: emp.branchId ? emp.branchId.toString() : ''
    });
    setErrorMsg('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMsg('');
      if (editingEmployee) {
        await employeeService.update(editingEmployee.id, formData);
        setEditingEmployee(null);
        success('Employee Updated', `${formData.fullName}'s details have been saved.`);
      } else {
        await employeeService.create(formData);
        setIsAddOpen(false);
        success('Employee Added', `${formData.fullName} has been added to the directory.`);
      }
      loadData();
    } catch (err: any) {
      const msg = err.message || 'Operation failed';
      setErrorMsg(msg);
      toastError('Action Failed', msg);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      await employeeService.toggleStatus(id, nextStatus);
      const emp = employees.find(e => e.id === id);
      if (nextStatus === 'SUSPENDED') {
        info('Employee Suspended', `${emp?.fullName ?? 'Employee'} has been suspended.`);
      } else {
        success('Employee Reactivated', `${emp?.fullName ?? 'Employee'} is now active.`);
      }
      loadData();
    } catch (err) {
      toastError('Status Update Failed', 'Could not update employee status. Please try again.');
      console.error('Failed to toggle status:', err);
    }
  };

  const filtered = employees.filter(emp => 
    emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
    emp.employeeNumber.toLowerCase().includes(search.toLowerCase()) ||
    emp.department.toLowerCase().includes(search.toLowerCase()) ||
    emp.position.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Employees Directory</h1>
          <p className="text-sm text-slate-500">Manage employee salary structures, card profiles, and statuses</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold px-4 py-2.5 rounded-lg text-sm shadow-sm transition-colors">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import CSV</span>
          </button>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Directory Search & Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-card overflow-hidden">
        {/* Search header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by name, ID, position, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-400 font-medium">{filtered.length} employees found</span>
        </div>

        {/* Employees Table */}
        <div className="overflow-x-auto max-h-[600px]">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={
                search
                  ? <UserPlusIcon size={36} strokeWidth={1.5} />
                  : <UserPlusIcon size={36} strokeWidth={1.5} />
              }
              title={search ? 'No results found' : 'No employees yet'}
              description={
                search
                  ? `No employees match "${search}". Try a different name, ID, or department.`
                  : 'Start building your team by adding your first employee to the directory.'
              }
              action={!search ? { label: '+ Add First Employee', onClick: handleOpenAdd } : undefined}
            />
          ) : (
            <table className="w-full border-collapse text-left text-sm text-slate-500 relative">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4">Emp No</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Department / Position</th>
                  <th className="px-6 py-4">Basic Salary</th>
                  <th className="px-6 py-4">Payment Method</th>
                  <th className="px-6 py-4">Account / Number</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-emerald-50/50 text-slate-700 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 font-bold text-slate-900">{emp.employeeNumber}</td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{emp.fullName}</span>
                        <span className="text-xs text-slate-400 block mt-0.5">{emp.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-slate-800 block">{emp.position}</span>
                        <span className="text-xs text-slate-400 block mt-0.5">{emp.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      KES {emp.salary.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        emp.paymentMethod === 'MPESA' ? 'bg-emerald-100 text-emerald-800' :
                        emp.paymentMethod === 'BANK' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {emp.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600 text-xs">
                      {emp.accountNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        emp.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2.5">
                        <button 
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded transition-colors"
                          title="Edit Employee"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(emp.id, emp.status)}
                          className={`p-1 rounded transition-colors ${
                            emp.status === 'ACTIVE' 
                              ? 'text-rose-400 hover:bg-rose-50 hover:text-rose-700' 
                              : 'text-emerald-400 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                          title={emp.status === 'ACTIVE' ? 'Suspend Employee' : 'Reactivate Employee'}
                        >
                          {emp.status === 'ACTIVE' ? <XCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal Dialog */}
      {(isAddOpen || editingEmployee) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl border border-slate-200 animate-fade-in">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">
                {editingEmployee ? 'Edit Employee Details' : 'Add New Employee Card'}
              </h3>
              <button 
                onClick={() => { setIsAddOpen(false); setEditingEmployee(null); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-xs font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full name */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g., James Mwangi"
                  />
                </div>

                {/* National ID */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">National ID / Passport</label>
                  <input
                    type="text"
                    name="nationalId"
                    required
                    value={formData.nationalId}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g., 32145678"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g., james@company.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g., 0712345678"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    {departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Position */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Position / Job Title</label>
                  <input
                    type="text"
                    name="position"
                    required
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g., Senior Cashier"
                  />
                </div>

                {/* Basic Salary */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Basic Monthly Salary (KES)</label>
                  <input
                    type="number"
                    name="salary"
                    required
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g., 45000"
                  />
                </div>

                {/* Tax PIN */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Tax KRA PIN / ID</label>
                  <input
                    type="text"
                    name="taxPin"
                    required
                    value={formData.taxPin}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g., A001234567Z"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Disbursement Method</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="MPESA">M-Pesa B2C</option>
                    <option value="BANK">Bank EFT Transfer</option>
                    <option value="AIRTEL">Airtel Money</option>
                  </select>
                </div>

                {/* Account Number */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    {formData.paymentMethod === 'BANK' ? 'Bank Account Number' : 'Mobile Money Phone Number'}
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    required
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder={formData.paymentMethod === 'BANK' ? 'e.g., 0110987654321' : 'e.g., 0712345678'}
                  />
                </div>

                {/* Branch */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Assigned Branch</label>
                  <select
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleInputChange}
                    className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">No branch (HQ)</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setIsAddOpen(false); setEditingEmployee(null); }}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 font-semibold rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
