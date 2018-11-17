import { TaskRepository, Status } from '../model'

export const createTask = (

  taskRepository: TaskRepository

) => (

  playerId: string,
  title: string,
  deadline: string = undefined

) =>

  taskRepository.saveTask({
    playerId,
    title,
    status: Status.INCOMPLETE,
    deadline
  })

