"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestAdvance = requestAdvance;
exports.getAllAdvances = getAllAdvances;
exports.approveAdvance = approveAdvance;
const db_1 = __importDefault(require("../db"));
async function requestAdvance(req, res) {
    try {
        const { employeeId, amount, repaymentPeriod } = req.body;
        if (!employeeId || !amount) {
            return res.status(400).json({ error: 'Employee ID and loan amount are required' });
        }
        const employee = await db_1.default.employee.findUnique({ where: { id: parseInt(employeeId) } });
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        const advance = await db_1.default.salaryAdvance.create({
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
    }
    catch (error) {
        console.error('Request advance error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
async function getAllAdvances(req, res) {
    try {
        const { status, employeeId } = req.query;
        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }
        if (employeeId) {
            whereClause.employeeId = parseInt(employeeId);
        }
        const advances = await db_1.default.salaryAdvance.findMany({
            where: whereClause,
            include: { employee: { include: { branch: true } } },
            orderBy: { createdAt: 'desc' }
        });
        return res.json(advances);
    }
    catch (error) {
        console.error('Fetch advances error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
async function approveAdvance(req, res) {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body; // APPROVED or REJECTED
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid approval status' });
        }
        const advance = await db_1.default.salaryAdvance.findUnique({ where: { id } });
        if (!advance) {
            return res.status(404).json({ error: 'Advance request not found' });
        }
        const updatedAdvance = await db_1.default.salaryAdvance.update({
            where: { id },
            data: { status },
            include: { employee: true }
        });
        return res.json(updatedAdvance);
    }
    catch (error) {
        console.error('Approve advance error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
