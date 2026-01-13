import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import process from 'node:process'
import { drizzle } from 'drizzle-orm/libsql/node'
import * as schema from '../database/schema'

export * as schema from '../database/schema'

const DB_FILE_PATH = process.env.DB_FILE_PATH || 'file:playground.sqlite'

export function useDrizzle(): LibSQLDatabase<typeof schema> {
  return drizzle(DB_FILE_PATH, {
    schema,
  })
}
