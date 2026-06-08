import { Router } from 'express';
import { login, register, getMe } from '../controllers/authController';
import { getAllEmployees, getEmployeeById, createEmployee, updateEmployee, toggleEmployeeStatus } from '../controllers/employeeController';
import { requestAdvance, getAllAdvances, approveAdvance } from '../controllers/advanceController';
import { generatePayrollDraft, getAllPayrollRuns, updatePayrollRun, updatePayrollPeriodStatus, executeBulkPayments } from '../controllers/payrollController';
import { getAllBranches, createBranch } from '../controllers/branchController';
import { getDashboardStats, getPayrollTrends, getDepartmentSummary } from '../controllers/reportController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Auth routes
router.post('/auth/login', login);
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

export default router;
