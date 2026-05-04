import type { MigrationConfig, MigrationMeta } from 'drizzle-orm/migrator'
import crypto from 'node:crypto'
import { migrationsConfig, storageName } from '#drizzle-migrations'
// eslint-disable-next-line ts/ban-ts-comment
// @ts-ignore - server types are incorrect during dev, but works fine in upstream nuxt projects
import { useDrizzle } from '#imports'
import { consola } from 'consola'
import { defineNitroPlugin, useStorage } from 'nitropack/runtime'
import { join } from 'pathe'

const logger = consola.withTag('drizzle-migrations')

interface $Drizzle {
  dialect: {
    migrate: (migrations: Iterable<MigrationMeta>, session: any, config: Partial<MigrationConfig> | string) => any
  }
  session: any
}

export default defineNitroPlugin(async (nitroApp) => {
  const db = useDrizzle() as unknown as $Drizzle

  let migrationsRun = false
  const migrations = await readMigrationStorage((msg) => {
    migrationsRun = true
    logger.info(msg)
  })

  await db.dialect.migrate(migrations, db, migrationsConfig)

  if (migrationsRun) {
    logger.success('Migrations complete.')
  }
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
 * - sql property uses a lazy getter to allow logging
 */
async function readMigrationStorage(runCallback?: (s: string) => void): Promise<MigrationMeta[]> {
  const storage = useStorage<string>(`assets:${storageName}`)
  const migrationQueries: MigrationMeta[] = []

  const migrations = []
  for (const name of await storage.getKeys()) {
    const path = join(name, 'migrations.sql')
    if (await storage.hasItem(path)) {
      migrations.push({ path, name })
    }
  }
  migrations.sort((a, b) => a.name.localeCompare(b.name))

  for (const migration of migrations) {
    const migrationPath = migration.path
    const migrationDate = migration.name.slice(0, 14)
    const query = (await storage.getItem(migrationPath))!

    const result = query.split('--> statement-breakpoint')

    const millis = formatToMillis(migrationDate)

    migrationQueries.push({
      get sql() {
        runCallback?.(`Running migration for '${migrationPath}' (hash: ${this.hash})`)
        return result
      },
      bps: true,
      folderMillis: millis,
      hash: crypto.createHash('sha256').update(query).digest('hex'),
      name: migrationPath,
    })
  }
  return migrationQueries
}

function formatToMillis(dateStr: string): number {
  const year = Number.parseInt(dateStr.slice(0, 4), 10)
  const month = Number.parseInt(dateStr.slice(4, 6), 10) - 1
  const day = Number.parseInt(dateStr.slice(6, 8), 10)
  const hour = Number.parseInt(dateStr.slice(8, 10), 10)
  const minute = Number.parseInt(dateStr.slice(10, 12), 10)
  const second = Number.parseInt(dateStr.slice(12, 14), 10)

  return Date.UTC(year, month, day, hour, minute, second)
}
