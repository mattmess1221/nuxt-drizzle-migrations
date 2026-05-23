import { integer, sqliteTable as table, text } from 'drizzle-orm/sqlite-core'

export const todos = table('todos', {
  id: integer().primaryKey(),
  title: text().notNull(),
  completed: integer({ mode: 'boolean' }).notNull().default(false),
})

export const users = table('users', {
  id: integer().primaryKey(),
  name: text().notNull(),
})
