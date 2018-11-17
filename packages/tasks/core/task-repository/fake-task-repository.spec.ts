import { taskRepositoryContract } from '..'
import { FakeTaskRepository } from '..'

describe('FakeTaskRepository', () => {
  taskRepositoryContract(() => FakeTaskRepository())
})
