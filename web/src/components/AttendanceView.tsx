import React, { useState } from 'react';
import { 
  Calendar, 
  UploadCloud, 
  CheckCircle2, 
  Plus, 
  Clock, 
  User, 
  MapPin,
  FileCheck
} from 'lucide-react';

export default function AttendanceView() {
  const [activeTab, setActiveTab] = useState<'logs' | 'shifts'>('logs');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  // Static mock attendance logs
  const [logs, setLogs] = useState([
    { id: 1, name: 'David Kimani', num: 'EMP001', date: '2026-06-08', shift: 'Morning', in: '08:00 AM', out: '05:00 PM', overtime: 1.0, status: 'Present' },
    { id: 2, name: 'Mercy Achieng', name_id: 'EMP002', date: '2026-06-08', shift: 'Morning', in: '07:45 AM', out: '06:15 PM', overtime: 2.5, status: 'Present' },
    { id: 3, name: 'Peter Ndwiga', num: 'EMP003', date: '2026-06-08', shift: 'Afternoon', in: '01:00 PM', out: '10:00 PM', overtime: 0.0, status: 'Present' },
    { id: 4, name: 'Sarah Mwangi', num: 'EMP004', date: '2026-06-08', shift: 'Morning', in: '08:02 AM', out: '05:00 PM', overtime: 0.0, status: 'Present' },
    { id: 5, name: 'James Omondi', num: 'EMP005', date: '2026-06-08', shift: 'Night', in: '10:00 PM', out: '07:00 AM', overtime: 1.0, status: 'Present' },
    { id: 6, name: 'Joseph Kiprop', num: 'EMP007', date: '2026-06-08', shift: 'Afternoon', in: '—', out: '—', overtime: 0.0, status: 'Absent' },
  ]);

  // Static mock shift templates
  const [shifts, setShifts] = useState([
    { id: 'morning', name: 'Morning Shift', hours: '08:00 AM - 05:00 PM', count: 12, branch: 'Main Supermarket' },
    { id: 'afternoon', name: 'Afternoon Shift', hours: '01:00 PM - 10:00 PM', count: 8, branch: 'Main Supermarket' },
    { id: 'night', name: 'Night Shift', hours: '10:00 PM - 07:00 AM', count: 4, branch: 'Wholesale Depot' }
  ]);

  const handleUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress(null);
            setShowUploadModal(false);
          }, 600);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Attendance & Shifts</h1>
          <p className="text-sm text-slate-500">Track cashier shifts, attendance records, and automatically feed overtime to payroll</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm shadow-sm transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Attendance sheet</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('logs')}
          className={`py-2.5 px-4 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'logs' 
              ? 'border-emerald-500 text-emerald-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Daily Attendance Logs
        </button>
        <button
          onClick={() => setActiveTab('shifts')}
          className={`py-2.5 px-4 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'shifts' 
              ? 'border-emerald-500 text-emerald-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          SME Shift Configurations
        </button>
      </div>

      {/* Content panel */}
      {activeTab === 'logs' ? (
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Assigned Shift</th>
                  <th className="px-6 py-4">Check-In</th>
                  <th className="px-6 py-4">Check-Out</th>
                  <th className="px-6 py-4">Overtime Hours</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 text-slate-700">
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{log.name}</span>
                        <span className="text-xs text-slate-400 block mt-0.5">{log.num || 'EMP002'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{log.date}</td>
                    <td className="px-6 py-4">
                      <span className="text-slate-800">{log.shift} Shift</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold">{log.in}</td>
                    <td className="px-6 py-4 text-xs font-semibold">{log.out}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {log.overtime > 0 ? `${log.overtime} hrs` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.status === 'Present' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shifts.map((s) => (
            <div key={s.id} className="bg-white p-5 border border-slate-200/80 rounded-xl shadow-card flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">{s.name}</span>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                  {s.count} Employees
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hours: {s.hours}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Branch: {s.branch}</span>
                </div>
              </div>
              <button className="w-full text-center border border-slate-200 hover:border-slate-300 text-slate-600 font-bold py-2 rounded-lg text-xs transition-colors">
                Configure Shift Roster
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-slate-200 animate-fade-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Upload Attendance Logs</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircleIcon />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center justify-center space-y-4">
              {uploadProgress !== null ? (
                <div className="w-full space-y-3 flex flex-col items-center py-4">
                  <LoaderIcon />
                  <span className="text-sm font-bold text-slate-700">Uploading logs... {uploadProgress}%</span>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-full border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center space-y-3 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/10 transition-all">
                    <UploadCloud className="w-10 h-10 text-slate-300" />
                    <span className="text-xs font-bold text-slate-600">Drag & drop attendance CSV here</span>
                    <span className="text-[10px] text-slate-400">Supports BIOMETRIC logs, fingerprint scanners, or Excel formats</span>
                  </div>
                  <button 
                    onClick={handleUpload}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-lg text-xs transition-colors"
                  >
                    Simulate Upload
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function XCircleIcon() {
  return (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
    </svg>
  );
}

function LoaderIcon() {
  return (
    <svg className="animate-spin w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
