import type { Migration } from './readMigration'
import { journal, storageName } from '#drizzle-migrations'
// eslint-disable-next-line ts/ban-ts-comment
// @ts-ignore
import { useDrizzle } from '#imports'
import { consola } from 'consola'
import { defineNitroPlugin, useStorage } from 'nitropack/runtime'
import { readMigrationStorage } from './readMigration'

const logger = consola.withTag('drizzle-migrations')

interface $Drizzle {
  dialect: {
    migrate: (migrations: Migration[], session: any, config: Record<any, any>) => any
  }
  session: any
}

export default defineNitroPlugin(async (nitroApp) => {
  const db = useDrizzle() as unknown as $Drizzle

  logger.info('Running migrations...')

  const storage = useStorage<string>(`assets:${storageName}`)
  const migrations = await readMigrationStorage(storage, journal)
  await db.dialect.migrate(migrations, db.session, { })

  // post migration tasks can be added here
  await nitroApp.hooks.callHook('drizzle:migrations:after')

  logger.success('Migrations complete.')
})
