import type { Config } from 'drizzle-kit'
import process from 'node:process'

export default {
  schema: 'server/database/schema.ts',
  out: 'server/database/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DB_FILE_PATH || 'file:./playground.db',
  },
  migrations: {
    table: '__playground__drizzle_migrations',
  },
} satisfies Config
