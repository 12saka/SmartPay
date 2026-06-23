import { Response } from 'express';
import prisma from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getAllNotifications(req: AuthenticatedRequest, res: Response) {
  try {
    const { category, status } = req.query;
    const whereClause: any = {};

    if (category) {
      whereClause.category = category as string;
    }
    if (status) {
      whereClause.status = status as string;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    return res.json(notifications);
  } catch (error: any) {
    console.error('Fetch notifications error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function markNotificationAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const updated = await prisma.notification.update({
      where: { id },
      data: { status: 'READ' }
    });
    return res.json(updated);
  } catch (error: any) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function markAllNotificationsAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    const updated = await prisma.notification.updateMany({
      where: { status: 'UNREAD' },
      data: { status: 'READ' }
    });
    return res.json({ success: true, count: updated.count });
  } catch (error: any) {
    console.error('Mark all notifications read error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
