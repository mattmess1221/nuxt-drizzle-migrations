import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { drizzle } from 'drizzle-orm/libsql/node'
import config from '~~/drizzle.config'
import * as schema from '../database/schema'

export * as schema from '../database/schema'

export function useDrizzle(): LibSQLDatabase<typeof schema> {
  return drizzle({
    connection: config.dbCredentials.url,
    schema,
  })
}
