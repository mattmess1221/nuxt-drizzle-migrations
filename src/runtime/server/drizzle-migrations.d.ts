declare module '#drizzle-migrations' {
  export const storageName: string
  export const migrationsConfig: Partial<import('drizzle-orm/migrator').MigrationConfig>
}
