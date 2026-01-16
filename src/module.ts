import { existsSync } from 'node:fs'
import { addServerImports, addServerPlugin, addServerTemplate, createResolver, defineNuxtModule, resolvePath, useLogger } from '@nuxt/kit'
import { globby } from 'globby'
import { basename, dirname, join } from 'pathe'
import { name, version } from '../package.json'

export interface ModuleOptions {
  /**
   * Path to the directory containing migration files
   * @default 'server/database/migrations'
   */
  migrationsPath: string
  /**
   * Name of the assets path to store migration files
   * @default 'migrations'
   */
  storageName: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'drizzleMigrations',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {
    migrationsPath: 'server/database/migrations',
    storageName: 'migrations',
  },
  async setup(options, nuxt) {
    const logger = useLogger('drizzle-migrations')
    const { resolve } = createResolver(import.meta.url)
    const migrationsPath = await resolvePath(options.migrationsPath)
    const migrationFolderVersion = await getMigrationFilesVersion(migrationsPath)
    if (migrationFolderVersion === null) {
      logger.error('Could not determine migration folder version. Check that the migrationsPath is correct and contains valid migration files.')
      return
    }

    logger.debug(`Detected migration folder version: ${migrationFolderVersion}`)

    nuxt.hook('nitro:config', (config) => {
      config.serverAssets ??= []
      config.serverAssets.push({
        baseName: options.storageName,
        dir: migrationsPath,
        pattern: '**/*.sql',
      })
    })
    nuxt.hook('nitro:prepare:types', ({ references }) => {
      references.push({ path: resolve('./runtime/server/types.d.ts') })
    })

    addServerImports({
      name: 'useDrizzle',
      from: resolve('./runtime/server/utils'),
      priority: -1,
    })

    addServerTemplate({
      filename: '#drizzle-migrations',
      getContents: () => `
        export { default as journal } from '#drizzle-migrations/journal';
        export const storageName = ${JSON.stringify(options.storageName)}

        export const migrationFolderVersion = ${JSON.stringify(migrationFolderVersion)};
        `,
    })

    addServerTemplate({
      filename: '#drizzle-migrations/journal',
      getContents: () => {
        if (migrationFolderVersion === 2) {
          const journalFile = join(migrationsPath, 'meta/_journal.json')
          return `export { default } from ${JSON.stringify(journalFile)}`
        }

        return generateMigrationJournal(migrationsPath)
      },
    })

    addServerPlugin(resolve('./runtime/server/plugin'))
  },
})

/**
 * Determine the version of migration files in the given path.
 *
 * @param migrationsPath The path to the migrations folder
 * @returns The migration files version (2 or 3), or null if it could not be determined
 */
async function getMigrationFilesVersion(migrationsPath: string): Promise<2 | 3 | null> {
  const journalPath = join(migrationsPath, 'meta/_journal.json')
  if (existsSync(journalPath)) {
    // file indicates version 2
    return 2
  }

  const migrations = await globby('*/migration.sql', { cwd: migrationsPath })
  if (migrations.length > 0) {
    return 3
  }

  // unknown version
  return null
}

/**
 * Generates a migration journal file content from the migration files in the given path.
 *
 * Requires migration files version 3 structure.
 *
 * @param migrationsPath The path to the migrations folder
 * @returns The generated journal file content as a string
 */
async function generateMigrationJournal(migrationsPath: string): Promise<string> {
  function formatToMillis(dateStr: string) {
    const year = Number.parseInt(dateStr.slice(0, 4), 10)
    const month = Number.parseInt(dateStr.slice(4, 6), 10) - 1
    const day = Number.parseInt(dateStr.slice(6, 8), 10)
    const hour = Number.parseInt(dateStr.slice(8, 10), 10)
    const minute = Number.parseInt(dateStr.slice(10, 12), 10)
    const second = Number.parseInt(dateStr.slice(12, 14), 10)

    return Date.UTC(year, month, day, hour, minute, second)
  }

  const entries = (await globby('*/migration.sql', { cwd: migrationsPath }))
    .toSorted((a, b) => a.localeCompare(b))
    .map((subdir) => {
      const migrationDate = subdir.slice(0, 14)

      const millis = formatToMillis(migrationDate)

      const tag = join(dirname(subdir), basename(subdir, '.sql'))

      return {
        tag,
        when: millis,
        breakpoints: true,
      }
    })
  return `\
export default ${JSON.stringify({ entries })}
`
}
