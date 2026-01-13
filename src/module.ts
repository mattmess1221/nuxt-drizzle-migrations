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
    nuxt.hook('nitro:config', (config) => {
      config.serverAssets ??= []
      config.serverAssets.push({
        baseName: options.storageName,
        dir: migrationsPath,
        pattern: '*.sql',
      })
    })

    addServerImports({
      name: 'useDrizzle',
      from: resolve('./runtime/server/utils'),
      priority: -1,
    })

    const journalFile = join(migrationsPath, 'meta/_journal.json')

    addServerTemplate({
      filename: '#drizzle-migrations',
      getContents: () => `
import { useStorage } from 'nitropack/runtime'
export { default as journal } from ${JSON.stringify(journalFile)} with { type: 'json' }
export const storageName = ${JSON.stringify(options.storageName)}
      `,
    })
    addServerPlugin(resolve('./runtime/server/plugin'))
  },
})
