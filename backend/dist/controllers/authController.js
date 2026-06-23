"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
exports.getMe = getMe;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const JWT_SECRET = process.env.JWT_SECRET || 'smartpay_sme_secret_jwt_key_2026';
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await db_1.default.user.findUnique({
            where: { email },
            include: { branch: true }
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name, role: user.role, branchId: user.branchId }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                branch: user.branch
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
async function register(req, res) {
    try {
        const { email, password, name, role, branchId } = req.body;
        if (!email || !password || !name || !role) {
            return res.status(400).json({ error: 'Email, password, name, and role are required' });
        }
        const validRoles = ['OWNER', 'MANAGER', 'HR', 'ACCOUNTANT', 'EMPLOYEE'];
        if (!validRoles.includes(role.toUpperCase())) {
            return res.status(400).json({ error: 'Invalid user role selected' });
        }
        const existingUser = await db_1.default.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'A user with this email address already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = await db_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role.toUpperCase(),
                branchId: branchId ? parseInt(branchId) : null
            },
            include: { branch: true }
        });
        const token = jsonwebtoken_1.default.sign({ id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role, branchId: newUser.branchId }, JWT_SECRET, { expiresIn: '7d' });
        return res.status(201).json({
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                branch: newUser.branch
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
async function getMe(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const user = await db_1.default.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                branch: true
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json(user);
    }
    catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
