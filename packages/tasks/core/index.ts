export {
  Status,
  Task,
  TaskRepository,
  AwardPrize,
  PenalizePlayer
} from './model'

export { createTask } from './use-cases/create-task'
export { completeTask } from './use-cases/complete-task'
export { checkDeadlines } from './use-cases/check-deadlines'

export { FakeTaskRepository } from './task-repository/fake-task-repository'
export { taskRepositoryContract } from './task-repository/task-repository.contract'
