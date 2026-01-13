# Nuxt Drizzle Migrations

A Nuxt module to automatically apply Drizzle migrations in your Nuxt application.

## Features

- Automatic database migration on server startup
- Configurable migration storage options

## Installation

Install the module using your preferred package manager:

```bash
pnpm add -D nuxt-drizzle-migrations
```

Then add it to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-drizzle-migrations'],
})
```

## Usage

> [!NOTE]
> Configuration requires setting up Drizzle and your database connection. See the [Drizzle documentation](https://orm.drizzle.team/docs/get-started) for more details.

Instructions will assume the following `drizzle.config.ts` file.

```ts
import type { Config } from 'drizzle-kit'

export default {
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  }
} satisfies Config
```

Nuxt Drizzle Migrations needs an instance of a Drizzle database to run migrations. Since the Nitro server doesn't support provides like Nuxt, you will need to register a composable named `useDrizzle` which returns your Drizzle database instance.

```ts
// server/utils/drizzle.ts
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '~~/server/database/schema'

export function useDrizzle() {
  return drizzle({
    connection: process.env.DATABASE_URL!,
    schema,
  })
}
```

If you need to do any custom post-migration tasks, you can hook into the migration process using Nitro hooks. The `drizzle:migrations:after` hook is called after all migrations have been applied.

```ts
// server/plugins/drizzle-migrations.ts
import { defineNitroPlugin } from 'nitropack/runtime'

export default defineNitroPlugin(async (nitroApp) => {
  nitroApp.hooks.hook('drizzle:migrations:after', async () => {
    // Custom post-migration tasks
  })
})
```
