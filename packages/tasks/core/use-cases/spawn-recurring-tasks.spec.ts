import {
  TaskRepository,
  RecurringTaskRepository,
  FakeTaskRepository,
  FakeRecurringTaskRepository,
  spawnRecurringTasks,
  Status,
  FindNextOccurrence,
} from '..'

describe('spawnRecurringTasks', () => {
  let taskRepository: TaskRepository
  let recurringTaskRepository: RecurringTaskRepository
  let findNextOccurrence: FindNextOccurrence
  let recurringTaskId: string
  let nextOccurrence: string

  const fakeDurationInterpreter =
    (duration: string, base: string) => `${duration} after ${base}`
  const now = '2018-11-05T12:00:00'
  const inTheFuture = '2018-11-05T12:00:01'
  const inThePast = '2018-11-05T11:59:59'
  const fartherInThePast = '2018-11-05T11:59:58'

  beforeEach(() => {
    taskRepository = FakeTaskRepository()
    recurringTaskRepository = FakeRecurringTaskRepository()
    findNextOccurrence = jest.fn(() => Promise.resolve(nextOccurrence))
    nextOccurrence = now

    return recurringTaskRepository.saveRecurringTask({
      title: 'a recurring task',
      cadence: 'the-cadence',
      duration: 'the-duration',
      playerId: 'player-a',
    }).then(id => recurringTaskId = id)
  })

  describe('when the recurring task has spawned before', () => {

    beforeEach(() =>
      taskRepository.saveTask({
        title: 'first instance of the task',
        playerId: 'player-a',
        status: Status.COMPLETE,
        createdAt: '2018-01-01T00:00:00',
        parentRecurringTaskId: recurringTaskId,
      }).then(() => taskRepository.saveTask({
        title: 'second instance of the task',
        playerId: 'player-a',
        status: Status.COMPLETE,
        createdAt: '2018-02-02T00:00:00',
        parentRecurringTaskId: recurringTaskId,
      }))
    )

    it('finds the next occurrence after the last spawned instance', () =>
      spawnRecurringTasks(
        taskRepository,
        recurringTaskRepository,
        findNextOccurrence,
        fakeDurationInterpreter,
      )(recurringTaskId, now)
        .then(() => {
          expect(
            findNextOccurrence
          ).toHaveBeenCalledWith(
            'the-cadence',
            '2018-02-02T00:00:00'
          )
        })
    )
  })

  describe('when the recurring task has not spawned before', () => {
    it('finds the first occurrence', () =>
      spawnRecurringTasks(
        taskRepository,
        recurringTaskRepository,
        findNextOccurrence,
        fakeDurationInterpreter,
      )(recurringTaskId, now)
        .then(() => {
          expect(
            findNextOccurrence
          ).toHaveBeenCalledWith(
            'the-cadence',
            undefined
          )
        })
    )
  })

  describe('when the recurring task\'s next occurrence is in the future', () => {
    beforeEach(() => nextOccurrence = inTheFuture)
    itDoesNotSpawnANewInstanceOfTheRecurringTask()
  })

  describe('when the recurring task\'s next occurrence is in the past', () => {
    beforeEach(() => { nextOccurrence = inThePast })

    describe('and there are no instances of the recurring task yet', () => {
      itSpawnsANewInstanceOfTheRecurringTask()
    })

    describe('and the latest instance of the recurring task is complete', () => {
      beforeEach(() =>
        taskRepository
          .saveTask({
            title: 'Already spawned instance of the recurring task',
            playerId: 'player-a',
            status: Status.COMPLETE,
            createdAt: fartherInThePast,
            parentRecurringTaskId: recurringTaskId,
          })
      )
      
      itSpawnsANewInstanceOfTheRecurringTask()
    })

    describe('and the latest instance of the recurring task is incomplete', () => {
      beforeEach(() =>
        taskRepository
          .saveTask({
            title: 'Already spawned instance of the recurring task',
            playerId: 'player-a',
            status: Status.INCOMPLETE,
            createdAt: fartherInThePast,
            parentRecurringTaskId: recurringTaskId,
          })
      )
      
      itDoesNotSpawnANewInstanceOfTheRecurringTask()
    })

    describe('and the latest instance of the recurring task is overdue', () => {
      beforeEach(() =>
        taskRepository
          .saveTask({
            title: 'Already spawned instance of the recurring task',
            playerId: 'player-a',
            status: Status.OVERDUE,
            createdAt: fartherInThePast,
            parentRecurringTaskId: recurringTaskId,
          })
      )
      
      itDoesNotSpawnANewInstanceOfTheRecurringTask()
    })
  })

  describe('when the recurring task\'s next occurrence is right now', () => {
    beforeEach(() => { nextOccurrence = now })

    describe('and there are no instances of the recurring task yet', () => {
      itSpawnsANewInstanceOfTheRecurringTask()
    })

    describe('and the latest instance of the recurring task is complete', () => {
      beforeEach(() => taskRepository.saveTask({
        title: 'Already spawned instance of the recurring task',
        playerId: 'player-a',
        status: Status.COMPLETE,
        createdAt: fartherInThePast,
        parentRecurringTaskId: recurringTaskId,
      }))
      
      itSpawnsANewInstanceOfTheRecurringTask()
    })

    describe('and the latest instance of the recurring task is incomplete', () => {
      beforeEach(() => taskRepository.saveTask({
        title: 'Already spawned instance of the recurring task',
        playerId: 'player-a',
        status: Status.INCOMPLETE,
        createdAt: fartherInThePast,
        parentRecurringTaskId: recurringTaskId,
      }))
      
      itDoesNotSpawnANewInstanceOfTheRecurringTask()
    })

    describe('and the latest instance of the recurring task is overdue', () => {
      beforeEach(() => taskRepository.saveTask({
        title: 'Already spawned instance of the recurring task',
        playerId: 'player-a',
        status: Status.OVERDUE,
        createdAt: fartherInThePast,
        parentRecurringTaskId: recurringTaskId,
      }))
      
      itDoesNotSpawnANewInstanceOfTheRecurringTask()
    })
  })

  function itDoesNotSpawnANewInstanceOfTheRecurringTask() {
    it('does not spawn a new instance of the recurring task', () =>
      taskRepository.findTasksForPlayer('player-a')
        .then(tasksBeforeSpawning =>

          spawnRecurringTasks(
            taskRepository,
            recurringTaskRepository,
            findNextOccurrence,
            fakeDurationInterpreter,
          )(recurringTaskId, now)

            .then(() => taskRepository.findTasksForPlayer('player-a'))
            .then(tasksAfterSpawning => {
              expect(
                tasksAfterSpawning.map(t => t.id)
              ).toEqual(tasksBeforeSpawning.map(t => t.id))
            })
        )
    )
  }

  function itSpawnsANewInstanceOfTheRecurringTask() {
    it('spawns a new instance of the recurring task', () =>
      taskRepository
        .findTasksForPlayer('player-a')
        .then(tasksBeforeSpawning =>

          spawnRecurringTasks(
            taskRepository,
            recurringTaskRepository,
            findNextOccurrence,
            fakeDurationInterpreter,
          )(recurringTaskId, now)

            .then(() => taskRepository.findTasksForPlayer('player-a'))
            .then(tasksAfterSpawning => {

              expect(
                tasksAfterSpawning.length
              ).toEqual(tasksBeforeSpawning.length + 1)

              const newTask = tasksAfterSpawning.find(task =>
                !tasksBeforeSpawning.map(t => t.id).includes(task.id)
              )

              expect(newTask.parentRecurringTaskId).toEqual(recurringTaskId)
              expect(newTask.title).toEqual('a recurring task')
              expect(newTask.status).toEqual(Status.INCOMPLETE)
              expect(newTask.deadline).toEqual(`the-duration after ${now}`)
              expect(newTask.createdAt).toEqual(now)
            })
        )
    )
  }
})
