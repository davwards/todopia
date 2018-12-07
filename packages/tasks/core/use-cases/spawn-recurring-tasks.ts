import {
  TaskRepository,
  RecurringTaskRepository,
  RecurringTask,
  FindNextOccurrence,
  CalculateDeadlineFromDuration,
  Status,
} from '../model'

export const spawnRecurringTasks = (

  taskRepository: TaskRepository,
  recurringTaskRepository: RecurringTaskRepository,
  cadenceInterpreter: FindNextOccurrence,
  durationInterpreter: CalculateDeadlineFromDuration,

) => (

  recurringTaskId: string,
  now: string

) => (

  recurringTaskRepository
    .findRecurringTask(recurringTaskId)
    .then(ifRecurringTaskIsDueToSpawn(cadenceInterpreter, now,
      recurringTask => 
        taskRepository.findInstancesOfRecurringTaskOnOrAfter(
          recurringTask.id,
          now
        ).then(instances => instances.length > 0
          ? null
          : taskRepository.saveTask({
            deadline: durationInterpreter(recurringTask.duration, now),
            title: recurringTask.title,
            playerId: recurringTask.playerId,
            status: Status.INCOMPLETE,
            parentRecurringTaskId: recurringTaskId,
            createdAt: now,
          }))
        )
    )

)


const ifRecurringTaskIsDueToSpawn = (

  cadenceInterpreter: FindNextOccurrence,
  now: string,
  fn: (recurringTask: RecurringTask) => Promise<any>

) => (

  recurringTask: RecurringTask
  
) => (
  
  cadenceInterpreter(recurringTask.cadence, now)
    .then(nextOccurrence =>
      new Date(nextOccurrence) <= new Date(now)
    ).then(shouldSpawn => shouldSpawn
      ? fn(recurringTask)
      : Promise.resolve()
    )

)
