declare module '#drizzle-migrations' {
  export const journal: typeof import('#drizzle-migrations/journal')['default']
  export const storageName: string
  export const migrationFolderVersion: 2 | 3
}

declare module '#drizzle-migrations/journal' {
  const journal: import('./readMigration').Journal
  export default journal
}
