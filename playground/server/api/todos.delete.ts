export default defineEventHandler(async () => {
  const db = useDrizzle()

  const result = await db.delete(schema.todos)

  return { rowCount: result.rowsAffected }
})
