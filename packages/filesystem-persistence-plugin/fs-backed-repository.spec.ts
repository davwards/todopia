import { taskRepositoryContract } from '@todopia/tasks-core'
import { playerRepositoryContract } from '@todopia/players-core'

import { promisify } from 'util'
import { mkdtempSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import * as rmdir from 'rimraf'

import { FsBackedRepository } from '.'

describe('FsBackedRepository', () => {
  let folder: string = null

  beforeEach(() => {
    folder = mkdtempSync(join(tmpdir(), 'todopia-tasks-fs-test-'))
  })

  taskRepositoryContract(() => FsBackedRepository(folder))
  playerRepositoryContract(() => FsBackedRepository(folder))

  afterEach(() =>
    promisify(rmdir)(folder)
  )
})
