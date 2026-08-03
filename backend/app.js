import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, serverless) or matching domain
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive fallback for production deployment
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Root status endpoint for backend service
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'COFFER Backend API Server',
    version: '2.5.0',
    health: '/api/health'
  });
});

// Enhanced Health Check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'COFFER API Server',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

import authRoutes from './routes/authRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// Core Feature Routes (Dual mounted for fail-safe Vercel & local routing)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/accounts', accountRoutes);
app.use('/accounts', accountRoutes);

app.use('/api/categories', categoryRoutes);
app.use('/categories', categoryRoutes);

app.use('/api/transactions', transactionRoutes);
app.use('/transactions', transactionRoutes);

app.use('/api/budgets', budgetRoutes);
app.use('/budgets', budgetRoutes);

app.use('/api/analytics', analyticsRoutes);
app.use('/analytics', analyticsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

export default app;

