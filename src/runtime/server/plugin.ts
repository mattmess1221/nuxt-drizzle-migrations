import { journal, storageName } from '#drizzle-migrations'
import { useDrizzle } from '#imports'
import { consola } from 'consola'
import { defineNitroPlugin, useStorage } from 'nitropack/runtime'
import { digest } from 'ohash'

const logger = consola.withTag('drizzle-migrations')

interface Migration {
  sql: string[]
  bps: boolean
  folderMillis: number
  hash: string
}

interface $Drizzle {
  dialect: {
    migrate: (migrations: Migration[], session: any, config: Record<any, any>) => any
  }
  session: any
}

export default defineNitroPlugin(async (nitroApp) => {
  const db = useDrizzle() as unknown as $Drizzle

  logger.info('Running migrations...')

  const migrations = await readMigrationStorage()
  await db.dialect.migrate(migrations, db.session, { })

  // post migration tasks can be added here
  await nitroApp.hooks.callHook('drizzle:migrations:after')

  logger.success('Migrations complete.')
})

/**
 * Reads migration queries from the given Unstorage instance.
 * Taken from 'drizzle-orm/migrator' but modified to read from unstorage instead of fs.
 */
async function readMigrationStorage(): Promise<Migration[]> {
  const storage = useStorage<string>(`assets:${storageName}`)
  const migrationQueries: Migration[] = []
  for (const journalEntry of journal.entries) {
    const migrationPath = `${journalEntry.tag}.sql`
    const query = await storage.getItem(migrationPath)
    if (query === null) {
      throw new Error(`No file ${migrationPath} found in storage`)
    }
    const result = query.split('--> statement-breakpoint')
    migrationQueries.push({
      sql: result,
      bps: journalEntry.breakpoints,
      folderMillis: journalEntry.when,
      hash: digest(query),
    })
  }
  return migrationQueries
}
