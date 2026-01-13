export default eventHandler<{ body: { title: string } }>(async (event) => {
  const db = useDrizzle()
  const body = await readBody(event)

  const [result] = await db.insert(schema.todos)
    .values({ title: body.title })
    .returning()
    .execute()

  return result
})
