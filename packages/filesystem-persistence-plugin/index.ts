import {
  Task,
  TaskRepository,
  Status
} from '@todopia/tasks-core'

import { promisify } from 'util'
import { join } from 'path'
import {
  readFile,
  writeFile,
  existsSync
} from 'fs'

export const FsBackedRepository = (

  folder: string,

) => (
  
  {
    findTasksForPlayer: (playerId: string) =>
      read(folder)
        .then(tasks =>
          Object.keys(tasks)
            .map(id => tasks[id])
            .filter(task => task.playerId === playerId)
        ),

    saveTask(task: Task) {
      const id = task.id
        || Math.round(Math.random() * 100000).toString()

      return read(folder)
        .then(tasks => {
          tasks[id] = Object.assign({}, task, {id})
          return write(folder, tasks)
        })
        .then(() => id)
    },

    findTask: (taskId: string) =>
      read(folder)
        .then(tasks => tasks[taskId])
        .then(task => {
          if(task) return task
          throw `No task found with id: ${taskId}`
        }),

    findExpiredTasks: (now: string) =>
      read(folder)
        .then(tasks => Object.keys(tasks)
          .map(id => tasks[id])
          .filter(task => new Date(task.deadline) < new Date(now))
          .filter(task => task.status === Status.INCOMPLETE)
        )
  }

)


const storagePath = (folder: string) => join(folder, 'tasks.json')

const read = (folder: string) =>
  existsSync(storagePath(folder))
    ? promisify(readFile)(storagePath(folder))
        .then(data => JSON.parse(data.toString()))
    : Promise.resolve({})

const write = (folder: string, data: {[id: string]: Task}) =>
  promisify(writeFile)(
    storagePath(folder),
    JSON.stringify(data)
  )

