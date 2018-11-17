import {
  createTask,
  Status,
  FakeTaskRepository
} from '..'

describe('Creating tasks', () => {
  let taskRepository = null

  beforeEach(() => {
    taskRepository = FakeTaskRepository()
  })

  describe('without deadlines', () => {
    it('creates tasks with the given attributes in INCOMPLETE status', () =>
      createTask(taskRepository)('player-a', 'Survey ley lines')
        .then(id => taskRepository.findTask(id))
        .then(task => {
          expect(task.title).toEqual('Survey ley lines')
          expect(task.playerId).toEqual('player-a')
          expect(task.status).toEqual(Status.INCOMPLETE)
        })
    )
  })

  describe('with deadlines', () => {
    it('creates tasks with the given attributes in INCOMPLETE status', () =>
      createTask(taskRepository)(
        'player-a',
        'Survey ley lines',
        '2018-11-05T12:00:00Z',
      )
        .then(id => taskRepository.findTask(id))
        .then(task => {
          expect(task.title).toEqual('Survey ley lines')
          expect(task.playerId).toEqual('player-a')
          expect(task.status).toEqual(Status.INCOMPLETE)
          expect(task.deadline).toEqual('2018-11-05T12:00:00Z')
        })
    )
  })
})

