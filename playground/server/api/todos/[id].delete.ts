import { eq } from 'drizzle-orm'

export default eventHandler(async (event) => {
  const db = useDrizzle()
  const id = Number(getRouterParam(event, 'id'))

  const result = await db.delete(schema.todos)
    .where(eq(schema.todos.id, id))
    .execute()

  return { rowCount: result.rowsAffected }
})
