import { TaskRepository, Task, Status } from '../model'

export function FakeTaskRepository(): TaskRepository {
  const tasks: {[taskId: string]: Task} = {}
  const taskList = () => Object.keys(tasks).map(id => tasks[id])

  return {
    findTasksForPlayer(playerId: string) {
      return Promise.resolve(
        taskList().filter(task => task.playerId === playerId)
      )
    },

    saveTask(task: Task) {
      const id = task.id || Math.round(Math.random() * 100000).toString()
      tasks[id] = Object.assign({}, task, {id})
      return Promise.resolve(id)
    },

    findTask(taskId: string) {
      return tasks[taskId]
        ? Promise.resolve(tasks[taskId])
        : Promise.reject(`No task found with id: ${taskId}`)
    },

    findExpiredTasks(now: string) {
      return Promise.resolve(
        taskList()
          .filter(task => new Date(task.deadline) < new Date(now))
          .filter(task => task.status === Status.INCOMPLETE)
      )
    },

    findAllCompletableTasksForPlayer(playerId: string) {
      return Promise.resolve(
        taskList()
          .filter(task => task.playerId === playerId)
          .filter(task => task.status !== Status.COMPLETE)
      )
    },

    findInstancesOfRecurringTaskOnOrAfter(
      recurringTaskId: string,
      time: string,
    ) {
      return Promise.resolve(taskList()
        .filter(task => task.parentRecurringTaskId === recurringTaskId)
        .filter(task => atOrAfter(task.createdAt, time))
      )
    },

    findLastInstanceOfRecurringTask(recurringTaskId: string) {
      return Promise.resolve(
        taskList()
          .filter(task => task.parentRecurringTaskId === recurringTaskId)
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
}


const atOrAfter = (a: string, b: string) =>
  new Date(a).getTime() >= new Date(b).getTime()
