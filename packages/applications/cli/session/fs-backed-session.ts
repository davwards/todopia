import { promisify } from 'util'
import { join } from 'path'
import {
  readFile,
  writeFile,
  existsSync
} from 'fs'

export const FsBackedSession = (

  folder: string

) => {

  const sessionStoragePath = join(folder, 'session')

  return {
    login: (id: string) =>
      promisify(writeFile)(sessionStoragePath, id),

    currentPlayer: () =>
      existsSync(sessionStoragePath)
        ? promisify(readFile)(sessionStoragePath)
            .then(data => data.toString())
        : null
  }

}
