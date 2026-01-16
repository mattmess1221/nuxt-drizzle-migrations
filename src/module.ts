import type { Config } from 'drizzle-kit'
import { addServerImports, addServerPlugin, addServerTemplate, createResolver, defineNuxtModule, findPath, resolvePath, useLogger } from '@nuxt/kit'
import { createJiti } from 'jiti'
import { join } from 'pathe'
import { name, version } from '../package.json'

const logger = useLogger('drizzle-migrations')

export interface ModuleOptions {
  /**
   * Path to the `drizzle.config.ts` file used for auto-detecting migration settings.
   *
   * Will auto-detect one of `['drizzle.config.ts', 'drizzle.config.js', 'drizzle.config.json']`
   *
   * @default auto-detect
   */
  configPath: string
  /**
   * Path to the directory containing migration files.
   *
   * If omitted, will try to read from {@linkcode configPath}.
   *
   * @default 'drizzle'
   */
  migrationsPath: string
  /**
   * Name of the assets path to store migration files
   * @default 'migrations'
   */
  storageName: string
}

export default defineNuxtModule<ModuleOptions>().with({
  meta: {
    name,
    version,
    configKey: 'drizzleMigrations',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {
    storageName: 'migrations',
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const configPath = await resolveDrizzleConfigPath(options.configPath)
    const drizzleConfig = configPath ? await readDrizzleConfig(configPath) : undefined

    const migrationsPath = await resolvePath(options.migrationsPath ?? drizzleConfig?.out ?? 'drizzle')

    const journalFile = join(migrationsPath, 'meta/_journal.json')
    nuxt.hook('nitro:config', (config) => {
      config.serverAssets ??= []
      config.serverAssets.push({
        baseName: options.storageName,
        dir: migrationsPath,
        pattern: '*.sql',
      })

      config.alias ??= {}
      config.alias['#drizzle-migrations/journal'] = journalFile
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
export { default as journal } from '#drizzle-migrations/journal'

export const storageName = ${JSON.stringify(options.storageName)}
      `,
    })
    addServerPlugin(resolve('./runtime/server/plugin'))
  },
})

/**
 * Resolves the Drizzle config path. If no path is provided, it attempts to auto-detect it.
 */
async function resolveDrizzleConfigPath(configPath?: string) {
  return configPath
    ? await resolvePath(configPath)
    : await findPath('drizzle.config', {
        extensions: ['.ts', '.js', '.json'],
        type: 'file',
      })
}

async function readDrizzleConfig(configPath: string) {
  const jiti = createJiti(import.meta.url)
  try {
    return await jiti.import<Config>(configPath, { default: true })
  }
  catch (e) {
    logger.error(`Failed to read Drizzle config at ${configPath}: ${(e as Error).message}`)
  }
}
