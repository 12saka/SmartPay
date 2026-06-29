import { Response } from 'express';
import prisma from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

// Helper to compute statutory deductions (Kenyan standard model or simplified equivalent)
function calculateDeductions(basicSalary: number) {
  // NSSF: 6% of basic salary capped at KES 1,080
  const nssf = Math.min(basicSalary * 0.06, 1080);
  
  // NHIF: Capped tier scale or flat 2.75%
  const nhif = Math.min(basicSalary * 0.0275, 1700);
  
  // PAYE: Progressive tax formula
  // Up to 24,000 -> 10%
  // Next 8,000 -> 25%
  // Above 32,000 -> 30%
  // Minus relief (KES 2,400)
  let taxable = basicSalary - nssf - nhif;
  let paye = 0;
  
  if (taxable > 24000) {
    paye += 24000 * 0.1;
    let nextTier = Math.min(taxable - 24000, 8000);
    paye += nextTier * 0.25;
    if (taxable > 32000) {
      paye += (taxable - 32000) * 0.3;
    }
  } else {
    paye = taxable * 0.1;
  }
  
  // Apply personal relief
  paye = Math.max(paye - 2400, 0);
  
  return {
    nssf: Math.round(nssf * 100) / 100,
    nhif: Math.round(nhif * 100) / 100,
    paye: Math.round(paye * 100) / 100,
    totalStatutory: Math.round((nssf + nhif + paye) * 100) / 100
  };
}

export async function generatePayrollDraft(req: AuthenticatedRequest, res: Response) {
  try {
    const { month, branchId } = req.body; // Format: YYYY-MM

    if (!month) {
      return res.status(400).json({ error: 'Payroll month (YYYY-MM) is required' });
    }

    // Fetch active employees (optionally filtered by branch)
    const employeesFilter: any = { status: 'ACTIVE' };
    if (branchId) {
      employeesFilter.branchId = parseInt(branchId);
    }

    const employees = await prisma.employee.findMany({
      where: employeesFilter,
      include: {
        advances: {
          where: { status: 'APPROVED' }
        }
      }
    });

    if (employees.length === 0) {
      return res.status(400).json({ error: 'No active employees found to process' });
    }

    const createdRecords = [];

    for (const employee of employees) {
      // Check if payroll already exists for this employee and month
      const existing = await prisma.payrollRun.findFirst({
        where: {
          month,
          employeeId: employee.id
        }
      });

      if (existing) {
        continue;
      }

      // Calculate statutory deductions (NSSF, NHIF, PAYE)
      const statutory = calculateDeductions(employee.salary);

      // Calculate auto advance deductions
      let advanceDeduction = 0;
      for (const advance of employee.advances) {
        const remaining = advance.amount - advance.deductedAmount;
        if (remaining > 0) {
          const monthlyInstallment = advance.amount / advance.repaymentPeriod;
          const deduction = Math.min(monthlyInstallment, remaining);
          advanceDeduction += deduction;
        }
      }

      const totalDeductions = statutory.totalStatutory + advanceDeduction;
      const netSalary = employee.salary - totalDeductions;

      const payrollRecord = await prisma.payrollRun.create({
        data: {
          month,
          employeeId: employee.id,
          basicSalary: employee.salary,
          overtimeHours: 0,
          overtimeRate: 0,
          bonusAmount: 0,
          deductions: statutory.totalStatutory,
          advanceDeduction,
          penalties: 0,
          netSalary: Math.max(netSalary, 0),
          status: 'DRAFT',
          branchId: employee.branchId
        }
      });

      createdRecords.push(payrollRecord);
    }

    return res.status(201).json({
      message: `Payroll draft generated for ${month}`,
      count: createdRecords.length
    });
  } catch (error: any) {
    console.error('Generate payroll draft error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAllPayrollRuns(req: AuthenticatedRequest, res: Response) {
  try {
    const { month, branchId, status } = req.query;
    const whereClause: any = {};

    if (month) {
      whereClause.month = month as string;
    }
    if (branchId) {
      whereClause.branchId = parseInt(branchId as string);
    }
    if (status) {
      whereClause.status = status as string;
    }

    const payrollRuns = await prisma.payrollRun.findMany({
      where: whereClause,
      include: { employee: { include: { branch: true } } },
      orderBy: { employee: { fullName: 'asc' } }
    });

    return res.json(payrollRuns);
  } catch (error: any) {
    console.error('Fetch payroll runs error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updatePayrollRun(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const { overtimeHours, overtimeRate, bonusAmount, penalties, status } = req.body;

    const record = await prisma.payrollRun.findUnique({
      where: { id },
      include: { employee: true }
    });

    if (!record) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    // Only allow modification if in DRAFT state
    if (record.status !== 'DRAFT' && !status) {
      return res.status(400).json({ error: 'Cannot modify payroll that has been approved/paid' });
    }

    const hours = overtimeHours !== undefined ? parseFloat(overtimeHours) : record.overtimeHours;
    const rate = overtimeRate !== undefined ? parseFloat(overtimeRate) : record.overtimeRate;
    const bonus = bonusAmount !== undefined ? parseFloat(bonusAmount) : record.bonusAmount;
    const penalty = penalties !== undefined ? parseFloat(penalties) : record.penalties;

    const overtimeTotal = hours * rate;
    const grossSalary = record.basicSalary + overtimeTotal + bonus;
    
    // Recalculate statutory taxes on new gross salary
    const statutory = calculateDeductions(grossSalary);
    const newDeductions = statutory.totalStatutory;

    const totalDeductions = newDeductions + record.advanceDeduction + penalty;
    const netSalary = grossSalary - totalDeductions;

    const updatedRecord = await prisma.payrollRun.update({
      where: { id },
      data: {
        overtimeHours: hours,
        overtimeRate: rate,
        bonusAmount: bonus,
        deductions: newDeductions,
        penalties: penalty,
        netSalary: Math.max(netSalary, 0),
        status: status || record.status
      },
      include: { employee: true }
    });

    return res.json(updatedRecord);
  } catch (error: any) {
    console.error('Update payroll run error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Multi-role approval workflow
export async function updatePayrollPeriodStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { month, branchId, action } = req.body; // Action: SUBMIT, FINANCE_APPROVE, COMPANY_APPROVE, RESET
    if (!month || !action) {
      return res.status(400).json({ error: 'Month and action are required' });
    }

    const whereClause: any = { month };
    if (branchId) {
      whereClause.branchId = parseInt(branchId);
    }

    // Determine target status
    let nextStatus = 'DRAFT';
    let currentRequiredStatus = 'DRAFT';

    if (action === 'SUBMIT') {
      nextStatus = 'SUBMITTED';
      currentRequiredStatus = 'DRAFT';
    } else if (action === 'FINANCE_APPROVE') {
      nextStatus = 'FINANCE_APPROVED';
      currentRequiredStatus = 'SUBMITTED';
    } else if (action === 'COMPANY_APPROVE') {
      nextStatus = 'APPROVED';
      currentRequiredStatus = 'FINANCE_APPROVED';
    } else if (action === 'RESET') {
      nextStatus = 'DRAFT';
    } else {
      return res.status(400).json({ error: 'Invalid approval action' });
    }

    // Guard role permissions
    if (action === 'SUBMIT' && !['OWNER', 'MANAGER'].includes(req.user?.role || '')) {
      return res.status(403).json({ error: 'Access denied: Owner or Manager required to submit draft' });
    }
    if (action === 'FINANCE_APPROVE' && req.user?.role !== 'ACCOUNTANT') {
      return res.status(403).json({ error: 'Access denied: Accountant required for finance approval' });
    }
    if (action === 'COMPANY_APPROVE' && !['OWNER', 'MANAGER'].includes(req.user?.role || '')) {
      return res.status(403).json({ error: 'Access denied: Owner or Manager required for final sign-off' });
    }
    if (action === 'RESET' && !['OWNER', 'MANAGER', 'ACCOUNTANT'].includes(req.user?.role || '')) {
      return res.status(403).json({ error: 'Access denied: Owner, Manager, or Accountant required to reset draft' });
    }

    if (action !== 'RESET') {
      whereClause.status = currentRequiredStatus;
    }

    const updated = await prisma.payrollRun.updateMany({
      where: whereClause,
      data: { status: nextStatus }
    });

    return res.json({
      message: `Successfully transitioned payroll runs to ${nextStatus}`,
      count: updated.count
    });
  } catch (error: any) {
    console.error('Update payroll period status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Click "Pay Employees" simulated execution
export async function executeBulkPayments(req: AuthenticatedRequest, res: Response) {
  try {
    const { month, branchId, paymentMethod } = req.body; // paymentMethod: MPESA, BANK, etc.

    if (!month) {
      return res.status(400).json({ error: 'Payroll month is required' });
    }

    const whereClause: any = {
      month,
      status: 'APPROVED' // Only pay approved payroll runs
    };
    
    if (branchId) {
      whereClause.branchId = parseInt(branchId);
    }

    const payrollRuns = await prisma.payrollRun.findMany({
      where: whereClause,
      include: { employee: true }
    });

    if (payrollRuns.length === 0) {
      return res.status(400).json({ error: 'No approved payroll records found for this period to process payment' });
    }

    const totalAmount = payrollRuns.reduce((sum, run) => sum + run.netSalary, 0);
    const referenceCode = `TX-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // Create a transaction record in processing state
    const transaction = await prisma.transaction.create({
      data: {
        payrollPeriod: month,
        totalAmount,
        paymentMethod: paymentMethod || 'ALL',
        status: 'PROCESSING',
        initiatorId: req.user?.id || 0,
        referenceCode
      }
    });

    // Update payroll run status to PAID and deduct approved advances
    for (const run of payrollRuns) {
      await prisma.payrollRun.update({
        where: { id: run.id },
        data: {
          status: 'PAID',
          paymentDate: new Date().toISOString().split('T')[0],
          paymentReference: referenceCode
        }
      });

      // Deduct advance balances
      if (run.advanceDeduction > 0) {
        const activeAdvances = await prisma.salaryAdvance.findMany({
          where: {
            employeeId: run.employeeId,
            status: 'APPROVED'
          }
        });

        let remainingToDeduct = run.advanceDeduction;
        for (const advance of activeAdvances) {
          const outstanding = advance.amount - advance.deductedAmount;
          if (outstanding > 0 && remainingToDeduct > 0) {
            const deduction = Math.min(outstanding, remainingToDeduct);
            const newDeductedAmount = advance.deductedAmount + deduction;
            
            await prisma.salaryAdvance.update({
              where: { id: advance.id },
              data: {
                deductedAmount: newDeductedAmount,
                status: newDeductedAmount >= advance.amount ? 'PAID' : 'APPROVED'
              }
            });
            
            remainingToDeduct -= deduction;
          }
        }
      }
    }

    // Complete transaction
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'COMPLETED' }
    });

    return res.json({
      message: 'Bulk payments executed successfully',
      transactionId: transaction.id,
      referenceCode,
      totalPaid: totalAmount,
      employeeCount: payrollRuns.length
    });
  } catch (error: any) {
    console.error('Execute bulk payments error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
