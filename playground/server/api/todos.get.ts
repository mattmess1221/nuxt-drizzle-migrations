export default eventHandler(async () => {
  const db = useDrizzle()

  return await db.select().from(schema.todos).execute()
})
