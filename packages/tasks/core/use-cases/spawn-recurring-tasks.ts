import {
  TaskRepository,
  RecurringTaskRepository,
  RecurringTask,
  Task,
  FindNextOccurrence,
  CalculateDeadlineFromDuration,
  Status,
} from '../model'

export const spawnRecurringTasks = (

  taskRepo: TaskRepository,
  recurringTaskRepo: RecurringTaskRepository,
  findNextOccurrence: FindNextOccurrence,
  durationInterpreter: CalculateDeadlineFromDuration,

) => (

  recurringTaskId: string,
  now: string

) => (

  recurringTaskRepo.findRecurringTask(recurringTaskId)
    .then(ifRecurringTaskShouldSpawn(taskRepo, findNextOccurrence, now,
      recurringTask => taskRepo.saveTask({
        deadline: durationInterpreter(recurringTask.duration, now),
        title: recurringTask.title,
        playerId: recurringTask.playerId,
        status: Status.INCOMPLETE,
        parentRecurringTaskId: recurringTaskId,
        createdAt: now,
      })
    ))

)


const ifRecurringTaskShouldSpawn = (

  taskRepo: TaskRepository,
  findNextOccurrence: FindNextOccurrence,
  now: string,
  fn: (recurringTask: RecurringTask) => Promise<any>

) => (

  recurringTask: RecurringTask

) => taskRepo
  .findLastInstanceOfRecurringTask(recurringTask.id)
  .then(lastInstance => {
    if(lastInstance && lastInstance.status !== Status.COMPLETE)
      return false

    return findNextOccurrence(
      recurringTask.cadence,
      lastInstance ? lastInstance.createdAt : undefined
    ).then(nextOccurrence =>
      new Date(nextOccurrence) <= new Date(now)
    )
  })
  .then(shouldSpawn => shouldSpawn ? fn(recurringTask) : null)

