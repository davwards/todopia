import { TaskRepository, Task, Status } from '../model'

export function FakeTaskRepository(): TaskRepository {
  const tasks: {[taskId: string]: Task} = {}

  return {
    findTasksForPlayer(playerId: string) {
      return Promise.resolve(
        Object.keys(tasks)
          .map(id => tasks[id])
          .filter(task => task.playerId === playerId)
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
        Object.keys(tasks)
          .map(id => tasks[id])
          .filter(task => new Date(task.deadline) < new Date(now))
          .filter(task => task.status === Status.INCOMPLETE)
      )
    }
  }
}
