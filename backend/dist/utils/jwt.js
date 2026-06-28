"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateTokens = (id, role, email, name, branchId) => {
    const jwtSecret = process.env.JWT_SECRET || 'smartpay_sme_secret_jwt_key_2026';
    const refreshSecret = process.env.REFRESH_SECRET || 'refreshsupersecretfallback';
    const accessToken = jsonwebtoken_1.default.sign({ id, role, email, name, branchId }, jwtSecret, { expiresIn: '15m' });
    const refreshToken = jsonwebtoken_1.default.sign({ id, role, email, name, branchId }, refreshSecret, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
const verifyToken = (token, isRefresh = false) => {
    const secret = isRefresh
        ? (process.env.REFRESH_SECRET || 'refreshsupersecretfallback')
        : (process.env.JWT_SECRET || 'smartpay_sme_secret_jwt_key_2026');
    try {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
