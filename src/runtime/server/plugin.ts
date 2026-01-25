import type { MigrationConfig, MigrationMeta } from 'drizzle-orm/migrator'
import { journal, migrationsConfig, storageName } from '#drizzle-migrations'
// eslint-disable-next-line ts/ban-ts-comment
// @ts-ignore - server types are incorrect during dev, but works fine in upstream nuxt projects
import { useDrizzle } from '#imports'
import { consola } from 'consola'
import { defineNitroPlugin, useStorage } from 'nitropack/runtime'
import { digest } from 'ohash'

const logger = consola.withTag('drizzle-migrations')

/**
 * Internal migration metadata including the path (name).
 */
interface StoredMigration extends MigrationMeta {
  path: string
}

interface $Drizzle {
  dialect: {
    migrate: (migrations: Iterable<MigrationMeta>, session: any, config: Partial<MigrationConfig> | string) => any
  }
  session: any
}

export default defineNitroPlugin(async (nitroApp) => {
  const db = useDrizzle() as unknown as $Drizzle

  const migrations = wrapMigrationsForLogging(await readMigrationStorage())
  await db.dialect.migrate(migrations, db.session, migrationsConfig)

  // post migration tasks can be added here
  await nitroApp.hooks.callHook('drizzle:migrations:after')
})

/**
 * Reads migration queries from the given Unstorage instance.
 *
 * Taken from 'drizzle-orm/migrator' with modifications.
 *
 * Differences:
 * - reads from unstorage instead of filesystem
 * - journal is imported directly via import aliases
 * - storage path is included in return value
 */
async function readMigrationStorage(): Promise<StoredMigration[]> {
  const storage = useStorage<string>(`assets:${storageName}`)
  const migrationQueries: StoredMigration[] = []
  for (const journalEntry of journal.entries) {
    const migrationPath = `${journalEntry.tag}.sql`
    const query = await storage.getItem(migrationPath)
    if (query === null) {
      throw new Error(`No file ${migrationPath} found in storage`)
    }
    const result = query.split('--> statement-breakpoint')
    migrationQueries.push({
      path: migrationPath,
      sql: result,
      bps: journalEntry.breakpoints,
      folderMillis: journalEntry.when,
      hash: digest(query),
    })
  }
  return migrationQueries
}

/**
 * Wrap stored migrations to log migrations.
 */
function* wrapMigrationsForLogging(migrations: StoredMigration[]): Generator<MigrationMeta> {
  let migrationsRun = false
  for (const { path, ...migration } of migrations) {
    yield {
      ...migration,
      get sql() {
        // `sql` is only accessed if the database migration is going to be run
        migrationsRun = true
        logger.info(`Running migration for '${path}' (hash: ${this.hash})`)
        return migration.sql
      },
    }
  }
  if (migrationsRun) {
    logger.success('Migrations complete.')
  }
}
