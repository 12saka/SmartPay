"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAuditLogs = getAllAuditLogs;
exports.logSecurityEvent = logSecurityEvent;
const db_1 = __importDefault(require("../db"));
async function getAllAuditLogs(req, res) {
    try {
        const { action, search } = req.query;
        const whereClause = {};
        if (action) {
            whereClause.action = action;
        }
        if (search) {
            whereClause.OR = [
                { userName: { contains: search } },
                { action: { contains: search } },
                { details: { contains: search } }
            ];
        }
        const auditLogs = await db_1.default.auditLog.findMany({
            where: whereClause,
            orderBy: { timestamp: 'desc' }
        });
        return res.json(auditLogs);
    }
    catch (error) {
        console.error('Fetch audit logs error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
async function logSecurityEvent(req, res) {
    try {
        const { action, details } = req.body;
        if (!action) {
            return res.status(400).json({ error: 'Action is required' });
        }
        const log = await db_1.default.auditLog.create({
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
    }
    catch (error) {
        console.error('Log security event error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
