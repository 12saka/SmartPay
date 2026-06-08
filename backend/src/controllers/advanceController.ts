import { Response } from 'express';
import prisma from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export async function requestAdvance(req: AuthenticatedRequest, res: Response) {
  try {
    const { employeeId, amount, repaymentPeriod } = req.body;

    if (!employeeId || !amount) {
      return res.status(400).json({ error: 'Employee ID and loan amount are required' });
    }

    const employee = await prisma.employee.findUnique({ where: { id: parseInt(employeeId) } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const advance = await prisma.salaryAdvance.create({
      data: {
        employeeId: parseInt(employeeId),
        amount: parseFloat(amount),
        repaymentPeriod: repaymentPeriod ? parseInt(repaymentPeriod) : 1,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'PENDING'
      },
      include: { employee: true }
    });

    return res.status(201).json(advance);
  } catch (error: any) {
    console.error('Request advance error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAllAdvances(req: AuthenticatedRequest, res: Response) {
  try {
    const { status, employeeId } = req.query;
    const whereClause: any = {};

    if (status) {
      whereClause.status = status as string;
    }
    if (employeeId) {
      whereClause.employeeId = parseInt(employeeId as string);
    }

    const advances = await prisma.salaryAdvance.findMany({
      where: whereClause,
      include: { employee: { include: { branch: true } } },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(advances);
  } catch (error: any) {
    console.error('Fetch advances error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function approveAdvance(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body; // APPROVED or REJECTED

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid approval status' });
    }

    const advance = await prisma.salaryAdvance.findUnique({ where: { id } });
    if (!advance) {
      return res.status(404).json({ error: 'Advance request not found' });
    }

    const updatedAdvance = await prisma.salaryAdvance.update({
      where: { id },
      data: { status },
      include: { employee: true }
    });

    return res.json(updatedAdvance);
  } catch (error: any) {
    console.error('Approve advance error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
