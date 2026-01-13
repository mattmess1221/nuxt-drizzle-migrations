declare module '#drizzle-migrations' {
  export const journal: import('./readMigration').Journal
  export const storageName: string
}
