import { RecurringTaskRepository, RecurringTask } from '../model'

export const FakeRecurringTaskRepository = (): RecurringTaskRepository => {
  const recurringTasks: {[taskId: string]: RecurringTask} = {}

  return {
    saveRecurringTask: (task: RecurringTask) => {
      const id = task.id || Math.round(Math.random() * 100000).toString()
      recurringTasks[id] = Object.assign({}, task, {id})
      return Promise.resolve(id)
    },

    findRecurringTask: (taskId: string) =>
      recurringTasks[taskId]
        ? Promise.resolve(recurringTasks[taskId])
        : Promise.reject(`No recurring task found with id: ${taskId}`),

    findRecurringTasksForPlayer: (playerId: string) => Promise.resolve(
      Object.keys(recurringTasks)
        .map(id => recurringTasks[id])
        .filter(task => task.playerId === playerId)
    )
  }
}
