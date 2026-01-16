import { addServerImports, addServerPlugin, addServerTemplate, createResolver, defineNuxtModule, resolvePath } from '@nuxt/kit'
import { join } from 'pathe'
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
    const { resolve } = createResolver(import.meta.url)
    const migrationsPath = await resolvePath(options.migrationsPath)
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
