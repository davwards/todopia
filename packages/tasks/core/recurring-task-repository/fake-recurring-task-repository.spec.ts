import {
  recurringTaskRepositoryContract,
  FakeRecurringTaskRepository
} from '..'

describe('FakeRecurringTaskRepository', () => {
  recurringTaskRepositoryContract(FakeRecurringTaskRepository)
})
