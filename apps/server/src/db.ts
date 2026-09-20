import path from 'path';
import { PrismaClient } from '../../../packages/database/node_modules/@prisma/client';

const absoluteDbPath = path.resolve(__dirname, '../../../packages/database/prisma/dev.db').replace(/\\/g, '/');
const dbUrl = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql:')
  ? process.env.DATABASE_URL
  : `file:${absoluteDbPath}`;

console.log(`[DB] Connecting to Prisma SQLite database at: ${dbUrl}`);

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});
