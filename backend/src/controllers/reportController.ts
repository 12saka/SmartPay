import { Response } from 'express';
import prisma from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getDashboardStats(req: AuthenticatedRequest, res: Response) {
  try {
    const { month, branchId } = req.query;
    const currentMonth = (month as string) || new Date().toISOString().substring(0, 7); // YYYY-MM
    
    const branchFilter: any = {};
    if (branchId) {
      branchFilter.branchId = parseInt(branchId as string);
    }

    // 1. Total Employees
    const totalEmployees = await prisma.employee.count({
      where: {
        status: 'ACTIVE',
        ...branchFilter
      }
    });

    // 2. Total Payroll cost for the selected period
    const payrollRuns = await prisma.payrollRun.findMany({
      where: {
        month: currentMonth,
        ...branchFilter
      }
    });

    const totalPayrollAmount = payrollRuns.reduce((sum, run) => sum + run.netSalary, 0);

    // 3. Paid Employees count
    const paidEmployees = payrollRuns.filter(run => run.status === 'PAID').length;

    // 4. Pending Employees count
    const pendingEmployees = payrollRuns.filter(run => run.status !== 'PAID').length;
    const pendingAmount = payrollRuns
      .filter(run => run.status !== 'PAID')
      .reduce((sum, run) => sum + run.netSalary, 0);

    // 5. Total branches
    const totalBranches = await prisma.branch.count();

    // 6. Recent Payments list
    const recentTransactions = await prisma.transaction.findMany({
      where: branchId ? { payrollPeriod: currentMonth } : {},
      orderBy: { timestamp: 'desc' },
      take: 5
    });

    return res.json({
      totalEmployees,
      totalPayrollAmount,
      paidEmployees,
      pendingEmployees,
      pendingAmount,
      totalBranches,
      recentTransactions
    });
  } catch (error: any) {
    console.error('Fetch dashboard stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPayrollTrends(req: AuthenticatedRequest, res: Response) {
  try {
    const { branchId } = req.query;
    const branchFilter: any = {};
    if (branchId) {
      branchFilter.branchId = parseInt(branchId as string);
    }

    // Group payroll costs by month for the last 6 months
    const payrolls = await prisma.payrollRun.findMany({
      where: branchFilter,
      select: {
        month: true,
        netSalary: true,
        basicSalary: true
      }
    });

    // Aggregate monthly data
    const monthlyMap: Record<string, { month: string; payrollAmount: number; employeeCount: number }> = {};
    
    payrolls.forEach(run => {
      if (!monthlyMap[run.month]) {
        monthlyMap[run.month] = {
          month: run.month,
          payrollAmount: 0,
          employeeCount: 0
        };
      }
      monthlyMap[run.month].payrollAmount += run.netSalary;
      monthlyMap[run.month].employeeCount += 1;
    });

    // Format as list sorted by month
    const trends = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

    return res.json(trends.slice(-6)); // Return last 6 months
  } catch (error: any) {
    console.error('Fetch payroll trends error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getDepartmentSummary(req: AuthenticatedRequest, res: Response) {
  try {
    const { month, branchId } = req.query;
    const currentMonth = (month as string) || new Date().toISOString().substring(0, 7);

    const whereClause: any = { month: currentMonth };
    if (branchId) {
      whereClause.branchId = parseInt(branchId as string);
    }

    const payrollRuns = await prisma.payrollRun.findMany({
      where: whereClause,
      include: { employee: true }
    });

    const deptMap: Record<string, { department: string; amount: number; percentage: number }> = {};
    let totalPayroll = 0;

    payrollRuns.forEach(run => {
      const dept = run.employee.department || 'Others';
      if (!deptMap[dept]) {
        deptMap[dept] = {
          department: dept,
          amount: 0,
          percentage: 0
        };
      }
      deptMap[dept].amount += run.netSalary;
      totalPayroll += run.netSalary;
    });

    // Calculate percentages
    const summaryList = Object.values(deptMap);
    if (totalPayroll > 0) {
      summaryList.forEach(dept => {
        dept.percentage = Math.round((dept.amount / totalPayroll) * 1000) / 10;
        dept.amount = Math.round(dept.amount * 100) / 100;
      });
    }

    return res.json({
      totalPayroll,
      departments: summaryList.sort((a, b) => b.amount - a.amount)
    });
  } catch (error: any) {
    console.error('Fetch department summary error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
