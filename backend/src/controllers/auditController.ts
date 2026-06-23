import { Response } from 'express';
import prisma from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getAllAuditLogs(req: AuthenticatedRequest, res: Response) {
  try {
    const { action, search } = req.query;
    const whereClause: any = {};

    if (action) {
      whereClause.action = action as string;
    }
    if (search) {
      whereClause.OR = [
        { userName: { contains: search as string } },
        { action: { contains: search as string } },
        { details: { contains: search as string } }
      ];
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' }
    });

    return res.json(auditLogs);
  } catch (error: any) {
    console.error('Fetch audit logs error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function logSecurityEvent(req: AuthenticatedRequest, res: Response) {
  try {
    const { action, details } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    const log = await prisma.auditLog.create({
      data: {
        userId: req.user?.id || null,
        userName: req.user?.name || 'SYSTEM',
        action,
        details,
        ipAddress: req.ip || '127.0.0.1',
        deviceDetails: req.headers['user-agent'] || 'UNKNOWN'
      }
    });

    return res.status(201).json(log);
  } catch (error: any) {
    console.error('Log security event error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
