import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Modal, 
  FlatList, 
  StatusBar as NativeStatusBar
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [apiBase, setApiBase] = useState('http://localhost:5000/api');
  const [showSettings, setShowSettings] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'payroll' | 'approvals'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Login form
  const [email, setEmail] = useState('owner@smartpay.com');
  const [password, setPassword] = useState('password123');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('MANAGER');

  // Business state
  const [stats, setStats] = useState<any>({
    totalEmployees: 156,
    totalPayrollAmount: 2450000,
    paidEmployees: 120,
    pendingEmployees: 36,
    pendingAmount: 540000,
    totalBranches: 4,
    recentTransactions: []
  });

  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
  const [advances, setAdvances] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  
  // Modals / Simulation
  const [selectedPayroll, setSelectedPayroll] = useState<any | null>(null);
  const [payoutProgress, setPayoutProgress] = useState<number | null>(null);
  const [payoutLogs, setPayoutLogs] = useState<string[]>([]);

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token, selectedMonth]);

  const handleAuth = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const url = isSignUp ? `${apiBase}/auth/register` : `${apiBase}/auth/login`;
      const body = isSignUp 
        ? { email, password, name, role }
        : { email, password };
        
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Authentication failed');
      
      setToken(data.token);
      setUser(data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [statsRes, payrollRes, advancesRes] = await Promise.all([
        fetch(`${apiBase}/reports/stats?month=${selectedMonth}`, { headers }),
        fetch(`${apiBase}/payroll?month=${selectedMonth}`, { headers }),
        fetch(`${apiBase}/advances?status=PENDING`, { headers })
      ]);

      const statsData = await statsRes.json();
      const payrollData = await payrollRes.json();
      const advancesData = await advancesRes.json();

      if (statsRes.ok && statsData.totalEmployees > 0) setStats(statsData);
      if (payrollRes.ok) setPayrollRuns(payrollData);
      if (advancesRes.ok) setAdvances(advancesData);
    } catch (err) {
      console.warn('Network error or server offline. Using pre-seeded states.', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAdvance = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`${apiBase}/advances/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerBulkPayout = () => {
    // Start progress simulation log
    setPayoutProgress(0);
    setPayoutLogs([]);
    
    const logsList = [
      'Authenticating Safaricom API...',
      'B2C channel active. Handshake OK.',
      'Queuing payroll records...',
      'Processing M-Pesa batch disbursements...',
      'Verifying individual callbacks...',
      'Success. All salaries disbursed.'
    ];

    let logIdx = 0;
    const interval = setInterval(async () => {
      setPayoutProgress(prev => {
        if (prev === null) return 0;
        const next = prev + 20;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(async () => {
            // Hit payout API
            try {
              await fetch(`${apiBase}/payroll/pay-bulk`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ month: selectedMonth })
              });
              setPayoutProgress(null);
              loadDashboardData();
            } catch (e) {
              setPayoutProgress(null);
            }
          }, 600);
          return 100;
        }
        return next;
      });

      if (logIdx < logsList.length) {
        setPayoutLogs(prev => [...prev, logsList[logIdx]]);
        logIdx++;
      }
    }, 800);
  };

  // Login layout
  if (!token) {
    return (
      <View style={styles.loginContainer}>
        <StatusBar style="light" />
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoIconText}>$</Text>
          </View>
          <Text style={styles.logoText}>smart<Text style={styles.logoHighlight}>Pay</Text></Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>
            {isSignUp ? 'Create Manager Account' : 'Owner & Manager Login'}
          </Text>
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          {isSignUp && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholder="e.g. James Smith"
                placeholderTextColor="#475569"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="e.g. owner@smartpay.com"
              placeholderTextColor="#475569"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#475569"
              autoCapitalize="none"
            />
          </View>

          {isSignUp && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>User Role</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                {['OWNER', 'MANAGER', 'ACCOUNTANT'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRole(r)}
                    style={{
                      flex: 1,
                      backgroundColor: role === r ? '#059669' : '#020617',
                      borderWidth: 1,
                      borderColor: '#1e293b',
                      borderRadius: 6,
                      paddingVertical: 6,
                      alignItems: 'center',
                      marginHorizontal: 2
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ marginTop: 16, alignItems: 'center' }} 
            onPress={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
          >
            <Text style={{ color: '#10b981', fontSize: 12, fontWeight: 'bold' }}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={{ paddingVertical: 8, alignItems: 'center' }} 
            onPress={() => setShowSettings(!showSettings)}
          >
            <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '600' }}>
              {showSettings ? 'Hide API Connection Settings' : 'Configure API Base URL'}
            </Text>
          </TouchableOpacity>

          {showSettings && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.label}>Backend API Base URL</Text>
              <TextInput
                value={apiBase}
                onChangeText={setApiBase}
                style={styles.input}
                placeholder="http://localhost:5000/api"
                placeholderTextColor="#475569"
                autoCapitalize="none"
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <TouchableOpacity
                  onPress={() => setApiBase('http://localhost:5000/api')}
                  style={{ backgroundColor: '#1e293b', padding: 6, borderRadius: 4, flex: 1, marginRight: 4, alignItems: 'center' }}
                >
                  <Text style={{ color: '#fff', fontSize: 9 }}>Local/iOS</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setApiBase('http://10.0.2.2:5000/api')}
                  style={{ backgroundColor: '#1e293b', padding: 6, borderRadius: 4, flex: 1, marginRight: 4, alignItems: 'center' }}
                >
                  <Text style={{ color: '#fff', fontSize: 9 }}>Android Emu</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setApiBase('http://192.168.1.100:5000/api')}
                  style={{ backgroundColor: '#1e293b', padding: 6, borderRadius: 4, flex: 1, alignItems: 'center' }}
                >
                  <Text style={{ color: '#fff', fontSize: 9 }}>Custom LAN</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {!isSignUp && (
          <Text style={styles.footerInfo}>Demo credentials: owner@smartpay.com / password123</Text>
        )}
      </View>
    );
  }

  // Dashboard layout
  return (
    <View style={styles.appContainer}>
      <StatusBar style="light" />
      
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>smart<Text style={styles.logoHighlight}>Pay</Text></Text>
        <TouchableOpacity style={styles.logoutButton} onPress={() => setToken(null)}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Main Tab Panels */}
      <View style={styles.content}>
        {currentTab === 'dashboard' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.welcomeText}>Welcome back, {user?.name || 'Owner'} 👋</Text>
            
            {/* Quick Stats Grid */}
            <View style={styles.grid}>
              <View style={styles.gridCard}>
                <Text style={styles.cardVal}>{stats.totalEmployees}</Text>
                <Text style={styles.cardLbl}>Total Employees</Text>
              </View>
              <View style={styles.gridCard}>
                <Text style={styles.cardVal}>KES {(stats.totalPayrollAmount / 1000000).toFixed(2)}M</Text>
                <Text style={styles.cardLbl}>Total Payroll</Text>
              </View>
              <View style={styles.gridCard}>
                <Text style={styles.cardVal}>{stats.paidEmployees}</Text>
                <Text style={styles.cardLbl}>Paid Employees</Text>
              </View>
              <View style={styles.gridCard}>
                <Text style={[styles.cardVal, { color: '#f59e0b' }]}>{stats.pendingEmployees}</Text>
                <Text style={styles.cardLbl}>Pending Payments</Text>
              </View>
            </View>

            {/* Recent Payments list */}
            <View style={styles.listCard}>
              <Text style={styles.sectionHeader}>Recent Payments</Text>
              
              <View style={styles.row}>
                <View>
                  <Text style={styles.rowTitle}>May 2024 Payroll</Text>
                  <Text style={styles.rowSub}>Paid via M-Pesa</Text>
                </View>
                <View style={styles.rowRight}>
                  <Text style={styles.rowValue}>KES 1,910,000</Text>
                  <Text style={styles.badgeSuccess}>Completed</Text>
                </View>
              </View>

              <View style={styles.row}>
                <View>
                  <Text style={styles.rowTitle}>April 2024 Payroll</Text>
                  <Text style={styles.rowSub}>Paid via Bank EFT</Text>
                </View>
                <View style={styles.rowRight}>
                  <Text style={styles.rowValue}>KES 1,750,000</Text>
                  <Text style={styles.badgeSuccess}>Completed</Text>
                </View>
              </View>

              <View style={styles.row}>
                <View>
                  <Text style={styles.rowTitle}>May 2024 Bonuses</Text>
                  <Text style={styles.rowSub}>Processing batch</Text>
                </View>
                <View style={styles.rowRight}>
                  <Text style={styles.rowValue}>KES 180,000</Text>
                  <Text style={styles.badgePending}>Pending</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}

        {currentTab === 'payroll' && (
          <View style={styles.tabContainer}>
            <Text style={styles.tabHeader}>Payroll Roster</Text>
            {loading ? (
              <ActivityIndicator color="#10b981" style={{ marginTop: 20 }} />
            ) : payrollRuns.length === 0 ? (
              <Text style={styles.emptyText}>No payroll runs calculated for this period.</Text>
            ) : (
              <FlatList
                data={payrollRuns}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.listItem}
                    onPress={() => setSelectedPayroll(item)}
                  >
                    <View>
                      <Text style={styles.listTitle}>{item.employee.fullName}</Text>
                      <Text style={styles.listSub}>{item.employee.position} · {item.employee.employeeNumber}</Text>
                    </View>
                    <View style={styles.listRight}>
                      <Text style={styles.listVal}>KES {item.netSalary.toLocaleString()}</Text>
                      <Text style={item.status === 'PAID' ? styles.badgeSuccess : styles.badgeDraft}>
                        {item.status}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        )}

        {currentTab === 'approvals' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.tabHeader}>Pending Approvals</Text>
            
            {/* Advances Approvals section */}
            <View style={styles.approvalSection}>
              <Text style={styles.subTitle}>Salary Advance Requests ({advances.length})</Text>
              {advances.length === 0 ? (
                <Text style={styles.emptyTextSmall}>No pending advance applications.</Text>
              ) : (
                advances.map(adv => (
                  <View key={adv.id} style={styles.approvalItem}>
                    <View>
                      <Text style={styles.approvalName}>{adv.employee.fullName}</Text>
                      <Text style={styles.approvalDetail}>Wants KES {adv.amount.toLocaleString()} (for {adv.repaymentPeriod} mo)</Text>
                    </View>
                    <View style={styles.actionsRow}>
                      <TouchableOpacity 
                        style={styles.actionBtnApprove}
                        onPress={() => handleApproveAdvance(adv.id, 'APPROVED')}
                      >
                        <Text style={styles.actionBtnText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionBtnReject}
                        onPress={() => handleApproveAdvance(adv.id, 'REJECTED')}
                      >
                        <Text style={styles.actionBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Payout Trigger section */}
            <View style={styles.payoutSection}>
              <Text style={styles.subTitle}>Bulk Salary Disbursement</Text>
              {payrollRuns.some(r => r.status === 'APPROVED') ? (
                <View style={styles.payoutCard}>
                  <Text style={styles.payoutCardTitle}>May Salaries Approved</Text>
                  <Text style={styles.payoutCardDetail}>
                    Ready to disburse KES {totalNetPay(payrollRuns).toLocaleString()} to {payrollRuns.filter(r => r.status === 'APPROVED').length} employees.
                  </Text>
                  <TouchableOpacity style={styles.payoutBtn} onPress={handleTriggerBulkPayout}>
                    <Text style={styles.payoutBtnText}>Disburse Bulk Salaries</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.emptyTextSmall}>No approved payroll batches waiting for disbursement.</Text>
              )}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity 
          style={styles.navBtn} 
          onPress={() => setCurrentTab('dashboard')}
        >
          <Text style={[styles.navBtnText, currentTab === 'dashboard' && styles.navBtnActive]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navBtn} 
          onPress={() => setCurrentTab('payroll')}
        >
          <Text style={[styles.navBtnText, currentTab === 'payroll' && styles.navBtnActive]}>Payroll</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navBtn} 
          onPress={() => setCurrentTab('approvals')}
        >
          <Text style={[styles.navBtnText, currentTab === 'approvals' && styles.navBtnActive]}>Approvals</Text>
        </TouchableOpacity>
      </View>

      {/* Detail Slide-up Modal */}
      {selectedPayroll && (
        <Modal transparent animationType="slide" visible={!!selectedPayroll}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalName}>{selectedPayroll.employee.fullName}</Text>
              <Text style={styles.modalMeta}>{selectedPayroll.employee.position} · {selectedPayroll.employee.employeeNumber}</Text>
              
              <View style={styles.divider} />
              
              {/* Earnings */}
              <View style={styles.modalRow}>
                <Text style={styles.modalRowLbl}>Basic Salary</Text>
                <Text style={styles.modalRowVal}>KES {selectedPayroll.basicSalary.toLocaleString()}</Text>
              </View>
              {selectedPayroll.overtimeHours > 0 && (
                <View style={styles.modalRow}>
                  <Text style={styles.modalRowLbl}>Overtime ({selectedPayroll.overtimeHours} hrs)</Text>
                  <Text style={styles.modalRowVal}>KES {(selectedPayroll.overtimeHours * selectedPayroll.overtimeRate).toLocaleString()}</Text>
                </View>
              )}
              {selectedPayroll.bonusAmount > 0 && (
                <View style={styles.modalRow}>
                  <Text style={styles.modalRowLbl}>Bonus</Text>
                  <Text style={styles.modalRowVal}>KES {selectedPayroll.bonusAmount.toLocaleString()}</Text>
                </View>
              )}

              {/* Deductions */}
              <View style={styles.modalRow}>
                <Text style={[styles.modalRowLbl, { color: '#f87171' }]}>Taxes & Statutory</Text>
                <Text style={[styles.modalRowVal, { color: '#f87171' }]}>- KES {selectedPayroll.deductions.toLocaleString()}</Text>
              </View>
              {selectedPayroll.advanceDeduction > 0 && (
                <View style={styles.modalRow}>
                  <Text style={[styles.modalRowLbl, { color: '#f87171' }]}>Advance Deduction</Text>
                  <Text style={[styles.modalRowVal, { color: '#f87171' }]}>- KES {selectedPayroll.advanceDeduction.toLocaleString()}</Text>
                </View>
              )}

              <View style={styles.divider} />
              
              <View style={styles.modalRow}>
                <Text style={styles.modalTotalLbl}>Net Salary</Text>
                <Text style={styles.modalTotalVal}>KES {selectedPayroll.netSalary.toLocaleString()}</Text>
              </View>

              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setSelectedPayroll(null)}
              >
                <Text style={styles.modalCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Payout Progress Overlay */}
      {payoutProgress !== null && (
        <Modal transparent visible={payoutProgress !== null}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b' }]}>
              <Text style={styles.simHeader}>M-Pesa Gateway Processing</Text>
              <ActivityIndicator color="#10b981" style={{ marginVertical: 15 }} />
              
              {/* Progress bar */}
              <Text style={styles.simProgress}>{payoutProgress}%</Text>
              <View style={styles.pBarTrack}>
                <View style={[styles.pBarFill, { width: `${payoutProgress}%` }]} />
              </View>

              {/* Terminal Logs */}
              <ScrollView style={styles.simLogs}>
                {payoutLogs.map((log, i) => (
                  <Text key={i} style={styles.simLogLine}>{log}</Text>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function totalNetPay(runs: any[]) {
  return runs.filter(r => r.status === 'APPROVED').reduce((sum, r) => sum + r.netSalary, 0);
}

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    backgroundColor: '#020617', // slate-950
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#059669', // emerald-600
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoIconText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoHighlight: {
    color: '#10b981', // emerald-500
  },
  card: {
    width: '100%',
    backgroundColor: '#0f172a', // slate-900
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e293b', // slate-800
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  cardHeader: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#059669',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  footerInfo: {
    color: '#475569',
    fontSize: 10,
    marginTop: 20,
    textAlign: 'center',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#020617',
    paddingTop: NativeStatusBar.currentHeight || 40,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 6,
  },
  logoutText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  cardVal: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardLbl: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: 'semibold',
    marginTop: 4,
  },
  listCard: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  sectionHeader: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  rowTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  rowSub: {
    color: '#475569',
    fontSize: 10,
    marginTop: 2,
  },
  rowValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  badgeSuccess: {
    backgroundColor: '#064e3b',
    color: '#34d399',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  badgePending: {
    backgroundColor: '#78350f',
    color: '#fbbf24',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  badgeDraft: {
    backgroundColor: '#334155',
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  navBar: {
    height: 60,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  navBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'semibold',
  },
  navBtnActive: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  tabContainer: {
    flex: 1,
    padding: 20,
  },
  tabHeader: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyText: {
    color: '#475569',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 40,
  },
  emptyTextSmall: {
    color: '#475569',
    fontSize: 11,
    paddingVertical: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  listTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  listSub: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 2,
  },
  listVal: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  listRight: {
    alignItems: 'flex-end',
  },
  approvalSection: {
    marginBottom: 24,
  },
  subTitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  approvalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  approvalName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  approvalDetail: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
  },
  actionBtnApprove: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 6,
  },
  actionBtnReject: {
    backgroundColor: '#7f1d1d',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  payoutSection: {
    marginTop: 10,
  },
  payoutCard: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  payoutCardTitle: {
    color: '#34d399',
    fontSize: 13,
    fontWeight: 'bold',
  },
  payoutCardDetail: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  payoutBtn: {
    backgroundColor: '#059669',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  payoutBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  modalName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalMeta: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 12,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  modalRowLbl: {
    color: '#64748b',
    fontSize: 12,
  },
  modalRowVal: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalTotalLbl: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalTotalVal: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalCloseBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  modalCloseBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  simHeader: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  simProgress: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  pBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  pBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  simLogs: {
    backgroundColor: '#020617',
    borderRadius: 10,
    padding: 12,
    height: 120,
  },
  simLogLine: {
    color: '#34d399',
    fontFamily: 'monospace',
    fontSize: 10,
    marginBottom: 4,
  }
});
