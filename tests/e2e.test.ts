import { unlink } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils'
import { afterAll, describe, expect, it } from 'vitest'

describe('e2e tests', async () => {
  const dbFilePath = join(dirname(fileURLToPath(import.meta.url)), 'e2e.test.sqlite')
  // Clean up the test database file before running tests
  await unlink(dbFilePath).catch(() => {})
  await setup({
    rootDir: './playground',
    env: {
      DB_FILE_PATH: `file://${dbFilePath}`,
    },
  })

  afterAll(async () => {
    await unlink(dbFilePath).catch(() => {})
  })

  it('migrations run on startup', async () => {
    const data = await $fetch('/api/todos')

    expect(data).toStrictEqual([])
  })
})
