import { Response } from 'express';
import prisma from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getAllBranches(req: AuthenticatedRequest, res: Response) {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { name: 'asc' }
    });
    return res.json(branches);
  } catch (error: any) {
    console.error('Fetch branches error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createBranch(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, location } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Branch name is required' });
    }

    const newBranch = await prisma.branch.create({
      data: { name, location }
    });

    return res.status(201).json(newBranch);
  } catch (error: any) {
    console.error('Create branch error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A branch with this name already exists' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
