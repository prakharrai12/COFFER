import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Health Check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'COFFER API Server', timestamp: new Date().toISOString() });
});

// Route mount placeholders (will be imported and mounted sequentially)
// import authRoutes from './routes/authRoutes.js';
// app.use('/api/auth', authRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

export default app;
