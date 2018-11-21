import {
  Task,
  TaskRepository,
  Status
} from '@todopia/tasks-core'

import { Player } from '@todopia/players-core'

import { promisify } from 'util'
import { join } from 'path'
import {
  readFile,
  writeFile,
  existsSync
} from 'fs'

export const FsBackedRepository = (

  folder: string,

) => {
  
  const storagePath = (file: string) =>
    join(folder, `${file}.json`)

  const read = (file: string) =>
    existsSync(storagePath(file))
      ? promisify(readFile)(storagePath(file))
          .then(data => JSON.parse(data.toString()))
      : Promise.resolve({})

  const write = (
    file: string,
    data: {[id: string]: Task}
  ) =>
    promisify(writeFile)(
      storagePath(file),
      JSON.stringify(data)
    )

  return {
    findTasksForPlayer: (playerId: string) =>
      read('tasks')
        .then(tasks =>
          Object.keys(tasks)
            .map(id => tasks[id])
            .filter(task => task.playerId === playerId)
        ),

    saveTask(task: Task) {
      const id = task.id
        || Math.round(Math.random() * 100000).toString()

      return read('tasks')
        .then(tasks => {
          tasks[id] = Object.assign({}, task, {id})
          return write('tasks', tasks)
        })
        .then(() => id)
    },

    findTask: (taskId: string) =>
      read('tasks')
        .then(tasks => tasks[taskId])
        .then(task => {
          if(task) return task
          throw `No task found with id: ${taskId}`
        }),

    findExpiredTasks: (now: string) =>
      read('tasks')
        .then(tasks => Object.keys(tasks)
          .map(id => tasks[id])
          .filter(task => new Date(task.deadline) < new Date(now))
          .filter(task => task.status === Status.INCOMPLETE)
        ),

    savePlayer: (player: Player) => {
      const id = player.id
        || Math.round(Math.random() * 100000).toString()

      return read('tasks')
        .then(players => {
          players[id] = Object.assign({}, player, {id})
          return write('players', players)
        })
        .then(() => id)
    },

    findPlayer: (playerId: string) =>
      read('players')
        .then(players => players[playerId])
        .then(player => {
          if(player) return player
          throw `No player found with id: ${playerId}`
        }),
  }

}

