import { eq } from 'drizzle-orm'

export default eventHandler(async (event) => {
  const db = useDrizzle()
  const id = Number(getRouterParam(event, 'id'))

  const [result] = await db.select()
    .from(schema.todos)
    .where(eq(schema.todos.id, id))
    .execute()

  return result
})
