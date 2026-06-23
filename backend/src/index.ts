import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'SmartPay Backend is running' });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`SmartPay server is running on http://0.0.0.0:${PORT}`);
});
