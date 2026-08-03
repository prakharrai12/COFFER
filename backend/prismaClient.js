import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Intelligent SQLite path resolver for Vercel Serverless read-only filesystem
if (process.env.VERCEL) {
  const tmpDbPath = '/tmp/dev.db';
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = `file:${tmpDbPath}`;
  }

  if (process.env.DATABASE_URL.includes('/tmp') && !fs.existsSync(tmpDbPath)) {
    try {
      const sourceDb = path.join(__dirname, 'prisma', 'dev.db');
      if (fs.existsSync(sourceDb)) {
        fs.copyFileSync(sourceDb, tmpDbPath);
        console.log('[COFFER PRISMA] Successfully initialized /tmp/dev.db for Vercel Serverless execution.');
      }
    } catch (err) {
      console.error('[COFFER PRISMA] Error copying SQLite database to /tmp:', err);
    }
  }
}

const prisma = new PrismaClient();

export default prisma;
