import { mkdtemp, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils'
import { afterAll, describe, expect, it } from 'vitest'

async function createTempDir(prefix = '/') {
  const ostmpdir = tmpdir()
  const tempDir = join(ostmpdir, prefix)
  return await mkdtemp(tempDir)
}

describe('e2e tests', async () => {
  const tempDir = await createTempDir()
  const dbFilePath = join(tempDir, 'e2e.test.sqlite')
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
