import { Response } from 'express';
import { hashPassword, verifyPassword } from '../utils/hash';
import { generateTokens } from '../utils/jwt';
import prisma from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export async function login(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { branch: true, organization: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'No SmartPay account exists for this email.' });
    }

    if (user.status === 'LOCKED') {
      if (user.lockoutUntil && user.lockoutUntil > new Date()) {
        return res.status(403).json({ error: 'Too many failed login attempts. Try again after 15 minutes.' });
      } else {
        // Unlock if time has passed
        await prisma.user.update({
          where: { id: user.id },
          data: { status: 'ACTIVE', failedLoginAttempts: 0, lockoutUntil: null }
        });
      }
    } else if (user.status === 'PENDING_VERIFICATION') {
      return res.status(403).json({ error: 'Your account has not yet been verified. Please check your email.' });
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      const newAttempts = user.failedLoginAttempts + 1;
      if (newAttempts >= 5) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: newAttempts,
            status: 'LOCKED',
            lockoutUntil: new Date(Date.now() + 15 * 60 * 1000)
          }
        });
        return res.status(401).json({ error: 'Too many failed login attempts. Account locked for 15 minutes.' });
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: newAttempts }
        });
        return res.status(401).json({ error: 'Password is incorrect.' });
      }
    }

    // Reset attempts on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lastLoginIp: req.ip }
    });

    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.role,
      user.email,
      user.name,
      user.branchId
    );

    return res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        organizationId: user.organizationId,
        branchId: user.branchId
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function register(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password, name, role, organizationId, branchId } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Email, password, name, and role are required' });
    }

    const validRoles = ['OWNER', 'MANAGER', 'HR', 'ACCOUNTANT', 'PAYROLL_OFFICER', 'EMPLOYEE'];
    if (!validRoles.includes(role.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid user role selected' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email address already exists' });
    }

    const hashedPassword = await hashPassword(password);

    let finalOrgId = organizationId ? parseInt(organizationId) : null;
    const companyName = req.body.companyName;

    if (companyName) {
      const org = await prisma.organization.create({
        data: {
          name: companyName,
          industry: req.body.industry || null,
          currency: req.body.currency || 'KES',
          payrollFrequency: (req.body.payrollFrequency || 'MONTHLY').toUpperCase(),
          paymentMethod: (req.body.paymentMethod || 'BANK').toUpperCase(),
          timezone: req.body.timezone || 'Africa/Nairobi',
          workingDays: req.body.workingDays || 'Monday-Friday',
        }
      });
      finalOrgId = org.id;
    }

    if (!finalOrgId) {
      let firstOrg = await prisma.organization.findFirst();
      if (!firstOrg) {
        firstOrg = await prisma.organization.create({
          data: {
            name: 'SmartPay SME',
            industry: 'Technology',
            currency: 'KES',
            payrollFrequency: 'MONTHLY',
            paymentMethod: 'BOTH',
            timezone: 'Africa/Nairobi',
            workingDays: 'Monday-Friday',
          }
        });
      }
      finalOrgId = firstOrg.id;
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role.toUpperCase(),
        organizationId: finalOrgId,
        branchId: branchId ? parseInt(branchId) : null,
        status: 'ACTIVE' // Default to ACTIVE so users can log in immediately
      }
    });

    if (role.toUpperCase() === 'EMPLOYEE') {
      const employeeNumber = 'EMP' + Math.floor(1000 + Math.random() * 9000);
      await prisma.employee.create({
        data: {
          employeeNumber,
          fullName: name,
          nationalId: req.body.nationalId || 'ID-' + Math.floor(Math.random() * 1000000),
          phone: req.body.phone || '',
          email: email.toLowerCase(),
          department: req.body.department || 'Operations',
          position: req.body.position || 'Associate',
          salary: req.body.salary ? parseFloat(req.body.salary) : 25000,
          employmentDate: new Date().toISOString().split('T')[0],
          paymentMethod: (req.body.paymentMethod || 'BANK').toUpperCase(),
          accountNumber: req.body.accountNumber || '',
          taxPin: req.body.taxPin || 'A00' + Math.floor(100000 + Math.random() * 900000) + 'Z',
          branchId: branchId ? parseInt(branchId) : null,
          status: 'ACTIVE'
        }
      });
    }

    return res.status(201).json({
      message: 'Account created successfully.',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        status: newUser.status
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        organization: true,
        branch: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (error: any) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
