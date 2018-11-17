import { TaskRepository, AwardPrize, Status } from '../model'

const TASK_COMPLETION_AWARD = 10

const update = (base, overrides) => Object.assign({}, base, overrides)

export const completeTask = (

  taskRepository: TaskRepository,
  awardPrize: AwardPrize

) => (

  taskId: string

) =>

  taskRepository
    .findTask(taskId)
    .then(task => task.status === Status.COMPLETE
      ? null
      : awardPrize(task.playerId, TASK_COMPLETION_AWARD)
          .then(() => taskRepository.saveTask(
            update(task, { status: Status.COMPLETE })
          ))
    )

