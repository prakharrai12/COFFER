import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`COFFER Backend API Server running on port ${PORT}`);
  });
}

export default (req, res) => {
  return app(req, res);
};
