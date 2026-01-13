import { eq } from 'drizzle-orm'

export default eventHandler<{ body: { title?: string, completed?: boolean } }>(async (event) => {
  const db = useDrizzle()
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const [result] = await db.update(schema.todos)
    .set({
      title: body.title,
      completed: body.completed || false,
    })
    .where(eq(schema.todos.id, id))
    .returning()
    .execute()

  return result
})
