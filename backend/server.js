import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Only start standalone listener if not running on Vercel Serverless
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`COFFER Backend API Server running on port ${PORT}`);
  });
}

export default app;
