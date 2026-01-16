declare module '#drizzle-migrations' {
  export { default as journal } from '#drizzle-migrations/journal'

  export const storageName: string
  export const migrationFolderVersion: 2 | 3
}

declare module '#drizzle-migrations/journal' {
  const journal: {
    entries: {
      when: number
      tag: string
      breakpoints: boolean
    }[]
  }
  export default journal
}
