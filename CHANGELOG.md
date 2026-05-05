# Changelog

## v0.3.1

[compare changes](https://github.com/mattmess1221/nuxt-drizzle-migrations/compare/v0.3.0...v0.3.1)

### 🩹 Fixes

- Replace ohash.digest with crypto hashing to match upstream drizzle ([#13](https://github.com/mattmess1221/nuxt-drizzle-migrations/pull/13))

### ❤️ Contributors

- Matthew Messinger <mattmess1221@gmail.com>

## v0.3.0

[compare changes](https://github.com/mattmess1221/nuxt-drizzle-migrations/compare/v0.2.0...v0.3.0)

### 🚀 Enhancements

- Allow configuration of migration table and schema ([#2](https://github.com/mattmess1221/nuxt-drizzle-migrations/pull/2))
- Log individual migrations only when they are run ([#3](https://github.com/mattmess1221/nuxt-drizzle-migrations/pull/3))

### 🩹 Fixes

- **playground:** Read env var for database url ([e48e840](https://github.com/mattmess1221/nuxt-drizzle-migrations/commit/e48e840))

### 🌊 Types

- **plugin:** Replace `Migration` with `MigrationMeta` from `drizzle-orm/migrator` ([942a011](https://github.com/mattmess1221/nuxt-drizzle-migrations/commit/942a011))

### 🏡 Chore

- **playground:** Update database configuration and module path in Nuxt config ([d4ac357](https://github.com/mattmess1221/nuxt-drizzle-migrations/commit/d4ac357))

### ❤️ Contributors

- Matthew Messinger <mattmess1221@gmail.com>

## v0.2.0

[compare changes](https://github.com/mattmess1221/nuxt-drizzle-migrations/compare/v0.1.1...v0.2.0)

### 🚀 Enhancements

- Load default `migrationsPath` from drizzle config file ([f92615a](https://github.com/mattmess1221/nuxt-drizzle-migrations/commit/f92615a))

### 💅 Refactors

- Load the journal file as an import alias ([d5b96b6](https://github.com/mattmess1221/nuxt-drizzle-migrations/commit/d5b96b6))

### 🌊 Types

- Add missing ts-ignore for server imports ([ac2c8cf](https://github.com/mattmess1221/nuxt-drizzle-migrations/commit/ac2c8cf))

### ❤️ Contributors

- Matthew Messinger <mattmess1221@gmail.com>

## v0.1.1

[compare changes](https://github.com/mattmess1221/nuxt-drizzle-migrations/compare/v0.1.0...v0.1.1)

### 🩹 Fixes

- Add server type references ([9614021](https://github.com/mattmess1221/nuxt-drizzle-migrations/commit/9614021))

### 🏡 Chore

- Add publish workflow ([c4c71c4](https://github.com/mattmess1221/nuxt-drizzle-migrations/commit/c4c71c4))

### ❤️ Contributors

- Matthew Messinger <mattmess1221@gmail.com>

## v0.1.0

Initial release
