import type { Storage } from 'unstorage'
import { digest } from 'ohash'

export interface JournalEntry {
  idx: number
  version: string
  when: number
  tag: string
  breakpoints: boolean
}

export interface Journal {
  version: string
  dialect: string
  entries: JournalEntry[]
}

export interface Migration {
  sql: string[]
  bps: boolean
  folderMillis: number
  hash: string
}

/**
 * Reads migration queries from the given Unstorage instance.
 * Taken from 'drizzle-orm/migrator' but modified to read from unstorage instead of fs.
 */
export async function readMigrationStorage(storage: Storage<string>, journal: Journal): Promise<Migration[]> {
  const migrationQueries: Migration[] = []
  for (const journalEntry of journal.entries) {
    const migrationPath = `${journalEntry.tag}.sql`
    const query = await storage.getItem(migrationPath)
    if (query === null) {
      throw new Error(`No file ${migrationPath} found in storage`)
    }
    const result = query.split('--> statement-breakpoint')
    migrationQueries.push({
      sql: result,
      bps: journalEntry.breakpoints,
      folderMillis: journalEntry.when,
      hash: digest(query),
    })
  }
  return migrationQueries
}
