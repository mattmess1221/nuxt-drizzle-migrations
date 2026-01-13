export default eventHandler(async () => {
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
})
