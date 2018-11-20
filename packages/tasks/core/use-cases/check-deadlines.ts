import {
  TaskRepository,
  Task,
  PenalizePlayer,
  Status,
} from '../model'

const MISSED_DEADLINE_PENALTY = 10

export const checkDeadlines = (

  taskRepository: TaskRepository,
  penalizePlayer: PenalizePlayer,

) => (
  
  currentTime: string,

) => (

  taskRepository
    .findExpiredTasks(currentTime)
    .then(tasks => Promise.all(
      tasks.map(task =>
        penalizePlayer(task.playerId, MISSED_DEADLINE_PENALTY)
          .then(markTaskOverdue(taskRepository, task))
      )
    ))

)


const update = (base, overrides) => Object.assign({}, base, overrides)

const markTaskOverdue = (repo: TaskRepository, task: Task) => () =>
  repo.saveTask(
    update(task, { status: Status.OVERDUE })
  )
