import type { MigrationConfig, MigrationMeta } from 'drizzle-orm/migrator'
import { journal, migrationsConfig, storageName } from '#drizzle-migrations'
// eslint-disable-next-line ts/ban-ts-comment
// @ts-ignore - server types are incorrect during dev, but works fine in upstream nuxt projects
import { useDrizzle } from '#imports'
import { consola } from 'consola'
import { defineNitroPlugin, useStorage } from 'nitropack/runtime'
import { digest } from 'ohash'

const logger = consola.withTag('drizzle-migrations')

interface $Drizzle {
  dialect: {
    migrate: (migrations: MigrationMeta[], session: any, config: Partial<MigrationConfig> | string) => any
  }
  session: any
}

export default defineNitroPlugin(async (nitroApp) => {
  const db = useDrizzle() as unknown as $Drizzle

  logger.info('Running migrations...')

  const migrations = await readMigrationStorage()
  await db.dialect.migrate(migrations, db.session, migrationsConfig)

  // post migration tasks can be added here
  await nitroApp.hooks.callHook('drizzle:migrations:after')

  logger.success('Migrations complete.')
})

/**
 * Reads migration queries from the given Unstorage instance.
 * Taken from 'drizzle-orm/migrator' but modified to read from unstorage instead of fs.
 */
async function readMigrationStorage(): Promise<MigrationMeta[]> {
  const storage = useStorage<string>(`assets:${storageName}`)
  const migrationQueries: MigrationMeta[] = []
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
