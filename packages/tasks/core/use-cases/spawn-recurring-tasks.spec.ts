import {
  TaskRepository,
  RecurringTaskRepository,
  FakeTaskRepository,
  FakeRecurringTaskRepository,
  spawnRecurringTasks,
  Status
} from '..'

describe('spawnRecurringTasks', () => {
  let taskRepository: TaskRepository
  let recurringTaskRepository: RecurringTaskRepository
  const now = '2018-11-05T12:00:00'
  let recurringTaskId: string

  beforeEach(() => {
    taskRepository = FakeTaskRepository()
    recurringTaskRepository = FakeRecurringTaskRepository()
  })

  describe('when the recurring task\'s next occurrence is in the future', () => {
    beforeEach(() =>
      recurringTaskRepository.saveRecurringTask({
        title: 'Recurring task with next occurrence in the future',
        cadence: 'FAKE CADENCE:FUTURE',
        duration: 'P1D',
        playerId: 'player-a',
      }).then(id => recurringTaskId = id)
    )

    itDoesNotSpawnANewInstanceOfTheRecurringTask()
  })

  describe('when the recurring task\'s next occurrence is in the past', () => {
    const recurringTask = {
      title: 'Recurring task with next occurrence in the future',
      cadence: 'FAKE CADENCE:PAST',
      duration: 'P1D',
      playerId: 'player-a',
    }

    beforeEach(() =>
      recurringTaskRepository
        .saveRecurringTask(recurringTask)
        .then(id => recurringTaskId = id)
    )

    describe('and there is already an instance of the recurring task at that time', () => {
      beforeEach(() =>
        taskRepository
          .saveTask({
            title: 'Already spawned instance of the recurring task',
            playerId: 'player-a',
            status: Status.INCOMPLETE,
            createdAt: now,
            parentRecurringTaskId: recurringTaskId,
          })
      )
      
      itDoesNotSpawnANewInstanceOfTheRecurringTask()
    })

    describe('and there is already an instance of the recurring task after that time', () => {
      beforeEach(() =>
        taskRepository
          .saveTask({
            title: 'Already spawned instance of the recurring task',
            playerId: 'player-a',
            status: Status.INCOMPLETE,
            createdAt: adjustedDate(now, 1),
            parentRecurringTaskId: recurringTaskId,
          })
      )
      
      itDoesNotSpawnANewInstanceOfTheRecurringTask()
    })

    describe('and there is no instance of the recurring task at or after that time', () => {
      it('spawns a new instance of the recurring task', () =>
        taskRepository.findTasksForPlayer('player-a')
          .then(tasksBeforeSpawning =>

            spawnRecurringTasks(
              taskRepository,
              recurringTaskRepository,
              fakeCadenceInterpreter,
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
                expect(newTask.title).toEqual(recurringTask.title)
                expect(newTask.status).toEqual(Status.INCOMPLETE)
                expect(newTask.deadline).toEqual('calculated deadline for: P1D')
                expect(newTask.createdAt).toEqual(now)
              })
          )
      )
    })
  })

  const adjustedDate = (baseDate: string, adjustment: number) => {
    const date = new Date(baseDate)
    date.setMinutes(date.getMinutes() + adjustment)
    return date.toISOString()
  }

  const fakeCadenceInterpreter =
    (cadence: string, currentTime: string,) =>
      Promise.resolve(
        adjustedDate(
          currentTime,
          {FUTURE: 1, PRESENT: 0, PAST: -1}[cadence.split(':')[1]]
        )
      )

  const fakeDurationInterpreter = (
    duration: string,
    currentTime: string,
  ) => Promise.resolve(`calculated deadline for: ${duration}`)
  
  function itDoesNotSpawnANewInstanceOfTheRecurringTask() {
    it('does not spawn a new instance of the recurring task', () =>
      taskRepository.findTasksForPlayer('player-a')
        .then(tasksBeforeSpawning =>

          spawnRecurringTasks(
            taskRepository,
            recurringTaskRepository,
            fakeCadenceInterpreter,
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
})
