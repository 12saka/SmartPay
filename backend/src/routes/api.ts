import { Router } from 'express';
import { login, register, getMe } from '../controllers/authController';
import { getAllEmployees, getEmployeeById, createEmployee, updateEmployee, toggleEmployeeStatus } from '../controllers/employeeController';
import { requestAdvance, getAllAdvances, approveAdvance } from '../controllers/advanceController';
import { generatePayrollDraft, getAllPayrollRuns, updatePayrollRun, updatePayrollPeriodStatus, executeBulkPayments } from '../controllers/payrollController';
import { getAllBranches, createBranch } from '../controllers/branchController';
import { getDashboardStats, getPayrollTrends, getDepartmentSummary } from '../controllers/reportController';
import { getAllNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../controllers/notificationController';
import { getAllAuditLogs, logSecurityEvent } from '../controllers/auditController';
import { getWalletBalances, getWalletTransactions, fundWallet } from '../controllers/walletController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { loginRateLimiter, apiRateLimiter } from '../middleware/rateLimit';

const router = Router();

// Apply general API rate limiter
router.use(apiRateLimiter);

// Auth routes
router.post('/auth/login', loginRateLimiter, login);
router.post('/auth/register', register);
router.get('/auth/me', authenticateToken, getMe);

// Employee routes
router.get('/employees', authenticateToken, getAllEmployees);
router.get('/employees/:id', authenticateToken, getEmployeeById);
router.post('/employees', authenticateToken, requireRole(['OWNER', 'MANAGER', 'HR']), createEmployee);
router.put('/employees/:id', authenticateToken, requireRole(['OWNER', 'MANAGER', 'HR']), updateEmployee);
router.put('/employees/:id/status', authenticateToken, requireRole(['OWNER', 'MANAGER']), toggleEmployeeStatus);

// Salary Advance routes
router.get('/advances', authenticateToken, getAllAdvances);
router.post('/advances', authenticateToken, requestAdvance);
router.put('/advances/:id/approve', authenticateToken, requireRole(['OWNER', 'MANAGER']), approveAdvance);

// Payroll routes
router.get('/payroll', authenticateToken, getAllPayrollRuns);
router.post('/payroll/draft', authenticateToken, requireRole(['OWNER', 'MANAGER', 'HR']), generatePayrollDraft);
router.put('/payroll/run/:id', authenticateToken, requireRole(['OWNER', 'MANAGER', 'HR']), updatePayrollRun);
router.put('/payroll/period-status', authenticateToken, requireRole(['OWNER', 'MANAGER', 'HR', 'ACCOUNTANT']), updatePayrollPeriodStatus);
router.post('/payroll/pay-bulk', authenticateToken, requireRole(['OWNER', 'ACCOUNTANT']), executeBulkPayments);

// Branch routes
router.get('/branches', authenticateToken, getAllBranches);
router.post('/branches', authenticateToken, requireRole(['OWNER']), createBranch);

// Report routes
router.get('/reports/stats', authenticateToken, getDashboardStats);
router.get('/reports/trends', authenticateToken, getPayrollTrends);
router.get('/reports/departments', authenticateToken, getDepartmentSummary);

// Notification routes
router.get('/notifications', authenticateToken, getAllNotifications);
router.put('/notifications/:id/read', authenticateToken, markNotificationAsRead);
router.put('/notifications/read-all', authenticateToken, markAllNotificationsAsRead);

// Wallet routes
router.get('/wallet/balances', authenticateToken, getWalletBalances);
router.get('/wallet/transactions', authenticateToken, getWalletTransactions);
router.post('/wallet/fund', authenticateToken, requireRole(['OWNER', 'ACCOUNTANT']), fundWallet);

// Audit routes
router.get('/audits', authenticateToken, requireRole(['OWNER', 'MANAGER']), getAllAuditLogs);
router.post('/audits', authenticateToken, logSecurityEvent);

export default router;
