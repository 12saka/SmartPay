"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const employeeController_1 = require("../controllers/employeeController");
const advanceController_1 = require("../controllers/advanceController");
const payrollController_1 = require("../controllers/payrollController");
const branchController_1 = require("../controllers/branchController");
const reportController_1 = require("../controllers/reportController");
const notificationController_1 = require("../controllers/notificationController");
const auditController_1 = require("../controllers/auditController");
const walletController_1 = require("../controllers/walletController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Auth routes
router.post('/auth/login', authController_1.login);
router.post('/auth/register', authController_1.register);
router.get('/auth/me', auth_1.authenticateToken, authController_1.getMe);
// Employee routes
router.get('/employees', auth_1.authenticateToken, employeeController_1.getAllEmployees);
router.get('/employees/:id', auth_1.authenticateToken, employeeController_1.getEmployeeById);
router.post('/employees', auth_1.authenticateToken, (0, auth_1.requireRole)(['OWNER', 'MANAGER', 'HR']), employeeController_1.createEmployee);
router.put('/employees/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['OWNER', 'MANAGER', 'HR']), employeeController_1.updateEmployee);
router.put('/employees/:id/status', auth_1.authenticateToken, (0, auth_1.requireRole)(['OWNER', 'MANAGER']), employeeController_1.toggleEmployeeStatus);
// Salary Advance routes
router.get('/advances', auth_1.authenticateToken, advanceController_1.getAllAdvances);
router.post('/advances', auth_1.authenticateToken, advanceController_1.requestAdvance);
router.put('/advances/:id/approve', auth_1.authenticateToken, (0, auth_1.requireRole)(['OWNER', 'MANAGER']), advanceController_1.approveAdvance);
// Payroll routes
router.get('/payroll', auth_1.authenticateToken, payrollController_1.getAllPayrollRuns);
router.post('/payroll/draft', auth_1.authenticateToken, (0, auth_1.requireRole)(['OWNER', 'MANAGER', 'HR']), payrollController_1.generatePayrollDraft);
router.put('/payroll/run/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['OWNER', 'MANAGER', 'HR']), payrollController_1.updatePayrollRun);
router.put('/payroll/period-status', auth_1.authenticateToken, (0, auth_1.requireRole)(['OWNER', 'MANAGER', 'HR', 'ACCOUNTANT']), payrollController_1.updatePayrollPeriodStatus);
router.post('/payroll/pay-bulk', auth_1.authenticateToken, (0, auth_1.requireRole)(['OWNER', 'ACCOUNTANT']), payrollController_1.executeBulkPayments);
// Branch routes
router.get('/branches', auth_1.authenticateToken, branchController_1.getAllBranches);
router.post('/branches', auth_1.authenticateToken, (0, auth_1.requireRole)(['OWNER']), branchController_1.createBranch);
// Report routes
router.get('/reports/stats', auth_1.authenticateToken, reportController_1.getDashboardStats);
router.get('/reports/trends', auth_1.authenticateToken, reportController_1.getPayrollTrends);
router.get('/reports/departments', auth_1.authenticateToken, reportController_1.getDepartmentSummary);
// Notification routes
router.get('/notifications', auth_1.authenticateToken, notificationController_1.getAllNotifications);
router.put('/notifications/:id/read', auth_1.authenticateToken, notificationController_1.markNotificationAsRead);
router.put('/notifications/read-all', auth_1.authenticateToken, notificationController_1.markAllNotificationsAsRead);
// Wallet routes
router.get('/wallet/balances', auth_1.authenticateToken, walletController_1.getWalletBalances);
router.get('/wallet/transactions', auth_1.authenticateToken, walletController_1.getWalletTransactions);
router.post('/wallet/fund', auth_1.authenticateToken, (0, auth_1.requireRole)(['OWNER', 'ACCOUNTANT']), walletController_1.fundWallet);
// Audit routes
router.get('/audits', auth_1.authenticateToken, (0, auth_1.requireRole)(['OWNER', 'MANAGER']), auditController_1.getAllAuditLogs);
router.post('/audits', auth_1.authenticateToken, auditController_1.logSecurityEvent);
exports.default = router;
