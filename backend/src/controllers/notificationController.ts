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

    // Filter notifications for employees to only show their own direct messages or global ones
    if (req.user && req.user.role === 'EMPLOYEE') {
      whereClause.OR = [
        { userId: req.user.id },
        { userId: null }
      ];
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

export async function createNotification(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId, title, message, category } = req.body;

    if (!title || !message || !category) {
      return res.status(400).json({ error: 'Title, message, and category are required' });
    }

    const newNotification = await prisma.notification.create({
      data: {
        userId: userId ? parseInt(userId) : null,
        title,
        message,
        category: category.toUpperCase(),
        status: 'UNREAD'
      }
    });

    return res.status(201).json(newNotification);
  } catch (error: any) {
    console.error('Create notification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
