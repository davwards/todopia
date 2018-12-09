import {
  Task,
  Status,
  RecurringTask,
} from '@todopia/tasks-core'

import {
  Player,
  CurrentPlayerState,
  LedgerEntry,
  currentStateReducer,
  initialPlayerState,
} from '@todopia/players-core'

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

  const emptyStateFor = (file: string) => {
    switch(file) {
      case 'tasks':
        return {}
      case 'recurring-tasks':
        return {}
      case 'players':
        return {}
      case 'ledger':
        return []
    }
  }
  
  const storagePath = (file: string) => join(folder, `${file}.json`)

  const read = (file: string) =>
    existsSync(storagePath(file))
      ? promisify(readFile)(storagePath(file))
          .then(data => JSON.parse(data.toString()))
      : Promise.resolve(emptyStateFor(file))

  const write = (file: string, data: {[id: string]: Task}) =>
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

    findAllCompletableTasksForPlayer: (playerId: string) =>
      read('tasks')
        .then(tasks => Object.keys(tasks)
          .map(id => tasks[id])
          .filter(task => task.playerId === playerId)
          .filter(task => task.status !== Status.COMPLETE)
        ),

    saveRecurringTask: (recurringTask: RecurringTask) => {
      const id = recurringTask.id
        || Math.round(Math.random() * 100000).toString()

      return read('recurring-tasks')
        .then(tasks => {
          tasks[id] = Object.assign({}, recurringTask, {id})
          return write('recurring-tasks', tasks)
        })
        .then(() => id)
    },

    findRecurringTask: (taskId: string) =>
      read('recurring-tasks')
        .then(tasks => tasks[taskId])
        .then(task => {
          if(task) return task
          throw `No recurring task found with id: ${taskId}`
        }),

    findRecurringTasksForPlayer: (playerId: string) =>
      read('recurring-tasks')
        .then(tasks => Object.keys(tasks).map(id => tasks[id]))
        .then(tasks => tasks.filter(task =>
          task.playerId === playerId
        )),

    savePlayer: (player: Player) => {
      const id = player.id
        || Math.round(Math.random() * 10000000).toString()

      return read('players')
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

    findAllPlayers: () =>
      read('players').then(players =>
        Object.keys(players).map(id => players[id])
      ),

    currentStateFor: (playerId: string) =>
      read('ledger')
        .then(entries =>
          entries.reduce(
            currentStateReducer, {}
          )[playerId] || initialPlayerState()
        ),

    addTransaction: (entry: LedgerEntry) =>
      read('ledger')
        .then(entries => {
          entries.push(entry)
          return write('ledger', entries)
        }),

    findInstancesOfRecurringTaskOnOrAfter: (
      recurringTaskId: string,
      time: string,
    ) => read('tasks')
        .then(tasks => Object.keys(tasks)
          .map(id => tasks[id])
          .filter(task => task.parentRecurringTaskId === recurringTaskId)
          .filter(task =>
            new Date(task.createdAt).getTime() >= new Date(time).getTime()
          )
        ),

    findLastInstanceOfRecurringTask: (recurringTaskId: string) =>
      read('tasks')
        .then(tasks => Object.keys(tasks).map(id => tasks[id]))
        .then(tasks => tasks .filter(
          task => task.parentRecurringTaskId === recurringTaskId)
        ).then(tasks =>
          tasks.length === 0
            ? undefined
            : tasks.reduce((latestTask, nextTask) =>
                new Date(latestTask.createdAt) > new Date(nextTask.createdAt)
                  ? latestTask
                  : nextTask
              )
        )
  }

}
