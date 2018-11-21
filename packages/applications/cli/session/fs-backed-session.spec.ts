import { promisify } from 'util'
import { mkdtempSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import * as rmdir from 'rimraf'

import { Session } from '../model'
import { FsBackedSession } from './fs-backed-session'

describe('FsBackedSession', () => {
  let folder: string = null
  let session: Session

  beforeEach(() => {
    folder = mkdtempSync(join(tmpdir(), 'todopia-cli-fs-test-'))
    session = FsBackedSession(folder)
  })

  it('finds the player by name and stores their id', () =>
    session
      .login('player-a')
      .then(() => session.currentPlayer())
      .then(id => expect(id).toEqual('player-a'))
  )

  afterEach(() =>
    promisify(rmdir)(folder)
  )
})
