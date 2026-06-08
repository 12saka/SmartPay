import { Response } from 'express';
import prisma from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getAllEmployees(req: AuthenticatedRequest, res: Response) {
  try {
    const { branchId, status } = req.query;
    const whereClause: any = {};

    if (branchId) {
      whereClause.branchId = parseInt(branchId as string);
    }
    if (status) {
      whereClause.status = status as string;
    }

    const employees = await prisma.employee.findMany({
      where: whereClause,
      include: { branch: true },
      orderBy: { fullName: 'asc' }
    });

    return res.json(employees);
  } catch (error: any) {
    console.error('Fetch employees error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getEmployeeById(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { branch: true, advances: true }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    return res.json(employee);
  } catch (error: any) {
    console.error('Fetch employee detail error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createEmployee(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      fullName,
      nationalId,
      phone,
      email,
      department,
      position,
      salary,
      employmentDate,
      paymentMethod,
      accountNumber,
      taxPin,
      branchId
    } = req.body;

    if (!fullName || !nationalId || !phone || !email || !salary || !paymentMethod || !accountNumber || !taxPin) {
      return res.status(400).json({ error: 'Missing required employee fields' });
    }

    // Generate unique employee number
    const employeeCount = await prisma.employee.count();
    const employeeNumber = `EMP${(employeeCount + 1).toString().padStart(3, '0')}`;

    const newEmployee = await prisma.employee.create({
      data: {
        employeeNumber,
        fullName,
        nationalId,
        phone,
        email,
        department,
        position,
        salary: parseFloat(salary),
        employmentDate: employmentDate || new Date().toISOString().split('T')[0],
        paymentMethod,
        accountNumber,
        taxPin,
        branchId: branchId ? parseInt(branchId) : null,
        status: 'ACTIVE'
      }
    });

    return res.status(201).json(newEmployee);
  } catch (error: any) {
    console.error('Create employee error:', error);
    // Check for unique constraint violation
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'An employee with this National ID or Employee Number already exists' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateEmployee(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;

    if (updateData.salary) {
      updateData.salary = parseFloat(updateData.salary);
    }
    if (updateData.branchId) {
      updateData.branchId = parseInt(updateData.branchId);
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: updateData
    });

    return res.json(updatedEmployee);
  } catch (error: any) {
    console.error('Update employee error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function toggleEmployeeStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body; // ACTIVE, SUSPENDED, ARCHIVED

    if (!['ACTIVE', 'SUSPENDED', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: { status }
    });

    return res.json(updatedEmployee);
  } catch (error: any) {
    console.error('Toggle status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
