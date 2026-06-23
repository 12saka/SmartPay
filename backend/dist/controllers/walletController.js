"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWalletBalances = getWalletBalances;
exports.getWalletTransactions = getWalletTransactions;
exports.fundWallet = fundWallet;
const db_1 = __importDefault(require("../db"));
async function getWalletBalances(req, res) {
    try {
        const wallets = await db_1.default.wallet.findMany({
            orderBy: { type: 'asc' }
        });
        return res.json(wallets);
    }
    catch (error) {
        console.error('Fetch wallet balances error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
async function getWalletTransactions(req, res) {
    try {
        const transactions = await db_1.default.walletTransaction.findMany({
            include: { wallet: true },
            orderBy: { timestamp: 'desc' }
        });
        return res.json(transactions);
    }
    catch (error) {
        console.error('Fetch wallet transactions error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
async function fundWallet(req, res) {
    try {
        const { walletType, amount, reference } = req.body;
        if (!walletType || !amount || !reference) {
            return res.status(400).json({ error: 'Wallet type, amount, and reference are required' });
        }
        // Find wallet by type
        const wallet = await db_1.default.wallet.findFirst({
            where: { type: walletType }
        });
        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }
        // Create deposit transaction and update balance
        const [updatedWallet, transaction] = await db_1.default.$transaction([
            db_1.default.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: parseFloat(amount) } }
            }),
            db_1.default.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    amount: parseFloat(amount),
                    type: 'DEPOSIT',
                    reference,
                    status: 'COMPLETED'
                }
            })
        ]);
        // Log audit event
        await db_1.default.auditLog.create({
            data: {
                userId: req.user?.id || null,
                userName: req.user?.name || 'SYSTEM',
                action: 'FUND_WALLET',
                details: `Funded ${walletType} wallet with KES ${parseFloat(amount).toLocaleString()} (Ref: ${reference})`,
                ipAddress: req.ip || '127.0.0.1',
                deviceDetails: req.headers['user-agent'] || 'UNKNOWN'
            }
        });
        return res.status(201).json({ wallet: updatedWallet, transaction });
    }
    catch (error) {
        console.error('Fund wallet error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
