"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllNotifications = getAllNotifications;
exports.markNotificationAsRead = markNotificationAsRead;
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
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
