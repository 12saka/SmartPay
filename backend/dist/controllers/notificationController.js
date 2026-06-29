"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllNotifications = getAllNotifications;
exports.markNotificationAsRead = markNotificationAsRead;
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
exports.createNotification = createNotification;
const db_1 = __importDefault(require("../db"));
async function getAllNotifications(req, res) {
    try {
        const { category, status } = req.query;
        const whereClause = {};
        if (category) {
            whereClause.category = category;
        }
        if (status) {
            whereClause.status = status;
        }
        // Filter notifications for employees to only show their own direct messages or global ones
        if (req.user && req.user.role === 'EMPLOYEE') {
            whereClause.OR = [
                { userId: req.user.id },
                { userId: null }
            ];
        }
        const notifications = await db_1.default.notification.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });
        return res.json(notifications);
    }
    catch (error) {
        console.error('Fetch notifications error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
async function markNotificationAsRead(req, res) {
    try {
        const id = parseInt(req.params.id);
        const updated = await db_1.default.notification.update({
            where: { id },
            data: { status: 'READ' }
        });
        return res.json(updated);
    }
    catch (error) {
        console.error('Mark notification read error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
async function markAllNotificationsAsRead(req, res) {
    try {
        const updated = await db_1.default.notification.updateMany({
            where: { status: 'UNREAD' },
            data: { status: 'READ' }
        });
        return res.json({ success: true, count: updated.count });
    }
    catch (error) {
        console.error('Mark all notifications read error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
async function createNotification(req, res) {
    try {
        const { userId, title, message, category } = req.body;
        if (!title || !message || !category) {
            return res.status(400).json({ error: 'Title, message, and category are required' });
        }
        const newNotification = await db_1.default.notification.create({
            data: {
                userId: userId ? parseInt(userId) : null,
                title,
                message,
                category: category.toUpperCase(),
                status: 'UNREAD'
            }
        });
        return res.status(201).json(newNotification);
    }
    catch (error) {
        console.error('Create notification error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
