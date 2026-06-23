import { Response } from 'express';
import prisma from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getWalletBalances(req: AuthenticatedRequest, res: Response) {
  try {
    const wallets = await prisma.wallet.findMany({
      orderBy: { type: 'asc' }
    });
    return res.json(wallets);
  } catch (error: any) {
    console.error('Fetch wallet balances error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getWalletTransactions(req: AuthenticatedRequest, res: Response) {
  try {
    const transactions = await prisma.walletTransaction.findMany({
      include: { wallet: true },
      orderBy: { timestamp: 'desc' }
    });
    return res.json(transactions);
  } catch (error: any) {
    console.error('Fetch wallet transactions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function fundWallet(req: AuthenticatedRequest, res: Response) {
  try {
    const { walletType, amount, reference } = req.body;

    if (!walletType || !amount || !reference) {
      return res.status(400).json({ error: 'Wallet type, amount, and reference are required' });
    }

    // Find wallet by type
    const wallet = await prisma.wallet.findFirst({
      where: { type: walletType }
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Create deposit transaction and update balance
    const [updatedWallet, transaction] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: parseFloat(amount) } }
      }),
      prisma.walletTransaction.create({
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
    await prisma.auditLog.create({
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
  } catch (error: any) {
    console.error('Fund wallet error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
