"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBranches = getAllBranches;
exports.createBranch = createBranch;
const db_1 = __importDefault(require("../db"));
async function getAllBranches(req, res) {
    try {
        const branches = await db_1.default.branch.findMany({
            orderBy: { name: 'asc' }
        });
        return res.json(branches);
    }
    catch (error) {
        console.error('Fetch branches error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
async function createBranch(req, res) {
    try {
        const { name, location } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Branch name is required' });
        }
        const newBranch = await db_1.default.branch.create({
            data: { name, location }
        });
        return res.status(201).json(newBranch);
    }
    catch (error) {
        console.error('Create branch error:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'A branch with this name already exists' });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
}
