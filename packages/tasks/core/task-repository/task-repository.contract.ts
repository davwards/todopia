import { TaskRepository, Status } from '../model'

export function taskRepositoryContract(getRepo: () => TaskRepository) {
  let repo: TaskRepository
  let now: string

  beforeEach(() => {
    repo = getRepo()
    now = '2018-11-05T12:00:00'
  })

  describe('behaving like a task repository', () => {
    it('resolves with an id on save which can be used to fetch the todo', () =>
      repo
        .saveTask({
          title: 'Survey ley lines',
          playerId: 'player-a',
          status: Status.INCOMPLETE,
          deadline: '2018-11-05T11:59:59Z',
          parentRecurringTaskId: 'some-recurring-task',
          createdAt: now,
        })
        .then(id => repo.findTask(id)
          .then(task => {
            expect(task.title).toEqual('Survey ley lines')
            expect(task.playerId).toEqual('player-a')
            expect(task.id).toEqual(id)
            expect(task.deadline).toEqual('2018-11-05T11:59:59Z')
            expect(task.parentRecurringTaskId).toEqual('some-recurring-task')
            expect(task.createdAt).toEqual(now)
          })
        )
    )

    it('updates tasks that have previously been saved', () =>
      repo
        .saveTask({
          title: 'Survey ley lines',
          playerId: 'player-a',
          status: Status.INCOMPLETE,
          createdAt: now,
        })
        .then(id =>
          repo.saveTask({
            id,
            title: 'Document ley lines',
            playerId: 'player-a',
            status: Status.INCOMPLETE,
            createdAt: now,
          })
          .then(newId => expect(newId).toEqual(id))
          .then(() => repo.findTask(id))
        )
        .then(task => expect(task.title).toEqual('Document ley lines'))
    )

    describe('when no todos have ever been created', () => {
      it('returns no todos for any player id', () =>
        repo.findTasksForPlayer('some-player')
          .then(result => expect(result).toEqual([]))
      )
    })

    describe('when asked to fetch a task id it doesnt recognize', () => {
      it('throws an error', () =>
        repo.findTask('nonsense-task-id')
          .then(task => { fail('Promise should have rejected!') })
          .catch(error => { expect(error).toEqual('No task found with id: nonsense-task-id') })
      )
    })

    describe('when todos have been created for a few players', () => {
      beforeEach(() =>
        repo
          .saveTask({
            title: 'Survey ley lines',
            playerId: 'player-a',
            status: Status.INCOMPLETE,
            createdAt: now,
          })
          .then(() => repo.saveTask({
            title: 'Collect reagents',
            playerId: 'player-a',
            status: Status.INCOMPLETE,
            createdAt: now,
          }))
          .then(() => repo.saveTask({
            title: 'Tame gryphon',
            playerId: 'player-b',
            status: Status.INCOMPLETE,
            createdAt: now,
          }))
          .then(() => repo.saveTask({
            title: 'Delve dungeon',
            playerId: 'player-b',
            status: Status.INCOMPLETE,
            createdAt: now,
          }))
      )

      it('returns todos according to the given player id', () =>
        repo
          .findTasksForPlayer('player-a')
          .then(tasks => {
            const titles = tasks.map(t => t.title)

            expect(titles).toContain('Survey ley lines')
            expect(titles).toContain('Collect reagents')
            expect(titles).not.toContain('Tame gryphon')
            expect(titles).not.toContain('Delve dungeon')
          })
      )
    })

    describe('fetching expired tasks', () => {
      const now = '2018-11-05T12:00:00Z'
      beforeEach(() =>
        repo
          .saveTask({
            title: 'Task with no deadline',
            playerId: 'player-a',
            status: Status.INCOMPLETE,
            createdAt: now,
          })
          .then(() => repo.saveTask({
            title: 'Incomplete task with deadline in the past',
            playerId: 'player-a',
            status: Status.INCOMPLETE,
            deadline: '2018-11-05T11:59:59Z',
            createdAt: now,
          }))
          .then(() => repo.saveTask({
            title: 'Completed task with deadline in the past',
            playerId: 'player-a',
            status: Status.COMPLETE,
            deadline: '2018-11-05T11:59:59Z',
            createdAt: now,
          }))
          .then(() => repo.saveTask({
            title: 'Overdue task with deadline in the past',
            playerId: 'player-a',
            status: Status.OVERDUE,
            deadline: '2018-11-05T11:59:59Z',
            createdAt: now,
          }))
          .then(() => repo.saveTask({
            title: 'Incomplete task with deadline right now',
            playerId: 'player-a',
            status: Status.INCOMPLETE,
            deadline: '2018-11-05T12:00:00Z',
            createdAt: now,
          }))
          .then(() => repo.saveTask({
            title: 'Incomplete task with deadline in the future',
            playerId: 'player-a',
            status: Status.INCOMPLETE,
            deadline: '2018-11-05T12:00:01Z',
            createdAt: now,
          }))
      )

      it('resolves with incomplete tasks with deadlines in the past', () =>
        repo
          .findExpiredTasks(now)
          .then(tasks => {
            const titles = tasks.map(t => t.title)

            expect(titles).toContain('Incomplete task with deadline in the past')
            expect(titles).not.toContain('Incomplete task with deadline in the future')
            expect(titles).not.toContain('Incomplete task with deadline right now')
            expect(titles).not.toContain('Overdue task with deadline in the past')
            expect(titles).not.toContain('Completed task with deadline in the past')
            expect(titles).not.toContain('Task with no deadline')
          })
      )
    })

    describe('fetching completable tasks for player', () => {
      beforeEach(() =>
        repo
          .saveTask({
            title: 'Incomplete task',
            playerId: 'player-a',
            status: Status.INCOMPLETE,
            createdAt: now,
          })
          .then(() => repo.saveTask({
            title: 'Incomplete task for a different player',
            playerId: 'player-b',
            status: Status.INCOMPLETE,
            createdAt: now,
          }))
          .then(() => repo.saveTask({
            title: 'Completed task',
            playerId: 'player-a',
            status: Status.COMPLETE,
            createdAt: now,
          }))
          .then(() => repo.saveTask({
            title: 'Overdue task',
            playerId: 'player-a',
            status: Status.OVERDUE,
            createdAt: now,
          }))
      )

      it('returns all tasks for a player except completed ones', () =>
        repo.findAllCompletableTasksForPlayer('player-a')
          .then(tasks => tasks.map(task => task.title))
          .then(tasks => {
            expect(tasks).toContain('Incomplete task')
            expect(tasks).toContain('Overdue task')
            expect(tasks).not.toContain('Incomplete task for a different player')
            expect(tasks).not.toContain('Completed task')
          })
      )
    })

    describe('fetching instances of recurring tasks', () => {
      const yesterday = '2018-11-04T12:00:00'
      const today = '2018-11-05T12:00:00'
      const tomorrow = '2018-11-06T12:00:00'

      beforeEach(() =>
        repo
          .saveTask({
            title: 'Incomplete task from yesterday',
            playerId: 'player-a',
            status: Status.INCOMPLETE,
            createdAt: yesterday,
            parentRecurringTaskId: 'some-recurring-task',
          })
          .then(() => repo.saveTask({
            title: 'Complete task from yesterday',
            playerId: 'player-b',
            status: Status.COMPLETE,
            createdAt: yesterday,
            parentRecurringTaskId: 'some-recurring-task',
          }))
          .then(() => repo.saveTask({
            title: 'Incomplete task from today',
            playerId: 'player-a',
            status: Status.INCOMPLETE,
            createdAt: today,
            parentRecurringTaskId: 'some-recurring-task',
          }))
          .then(() => repo.saveTask({
            title: 'Complete task from today',
            playerId: 'player-b',
            status: Status.COMPLETE,
            createdAt: today,
            parentRecurringTaskId: 'some-recurring-task',
          }))
          .then(() => repo.saveTask({
            title: 'Incomplete task from tomorrow',
            playerId: 'player-a',
            status: Status.INCOMPLETE,
            createdAt: tomorrow,
            parentRecurringTaskId: 'some-recurring-task',
          }))
          .then(() => repo.saveTask({
            title: 'Complete task from tomorrow',
            playerId: 'player-b',
            status: Status.COMPLETE,
            createdAt: tomorrow,
            parentRecurringTaskId: 'some-recurring-task',
          }))
          .then(() => repo.saveTask({
            title: 'Instance of a different recurring task',
            playerId: 'player-b',
            status: Status.COMPLETE,
            createdAt: tomorrow,
            parentRecurringTaskId: 'some-other-recurring-task',
          }))
      )

      it('returns all tasks with the given parentRecurringTaskId created on or after the given time, regardless of status', () =>
        repo.findInstancesOfRecurringTaskOnOrAfter('some-recurring-task', today)
          .then(tasks => tasks.map(task => task.title))
          .then(tasks => {
            expect(tasks).toContain('Incomplete task from today')
            expect(tasks).toContain('Complete task from today')
            expect(tasks).toContain('Incomplete task from tomorrow')
            expect(tasks).toContain('Complete task from tomorrow')

            expect(tasks).not.toContain('Incomplete task from yesterday')
            expect(tasks).not.toContain('Completed task from yesterday')
            expect(tasks).not.toContain('Instance of a different recurring task')
          })
      )
    })

    describe('fetching the latest instance of a recurring tasks', () => {
      beforeEach(() =>
        repo
          .saveTask({
            title: 'instance of the wrong recurring task',
            playerId: 'player-a',
            status: Status.INCOMPLETE,
            createdAt: '2018-12-01T00:00:00',
            parentRecurringTaskId: 'some-other-recurring-task',
          })
          .then(() => repo.saveTask({
            title: 'earlier instance of the right recurring task',
            playerId: 'player-a',
            status: Status.INCOMPLETE,
            createdAt: '2018-01-01T00:00:00',
            parentRecurringTaskId: 'some-recurring-task',
          }))
          .then(() => repo.saveTask({
            title: 'latest instance of the right recurring task',
            playerId: 'player-a',
            status: Status.INCOMPLETE,
            createdAt: '2018-11-01T00:00:00',
            parentRecurringTaskId: 'some-recurring-task',
          }))
          .then(() => repo.saveTask({
            title: 'early instance of the right recurring task',
            playerId: 'player-a',
            status: Status.INCOMPLETE,
            createdAt: '2018-06-01T00:00:00',
            parentRecurringTaskId: 'some-recurring-task',
          }))
      )

      it('returns the last instance of the recurring task', () =>
        repo.findLastInstanceOfRecurringTask('some-recurring-task')
          .then(task => {
            expect(task.title).toEqual('latest instance of the right recurring task')
            expect(task.playerId).toEqual('player-a')
            expect(task.status).toEqual(Status.INCOMPLETE)
            expect(task.createdAt).toEqual('2018-11-01T00:00:00')
            expect(task.parentRecurringTaskId).toEqual('some-recurring-task')
          })
      )

      it('returns undefined when no instances of the recurring task exist', () =>
        repo.findLastInstanceOfRecurringTask('recurring-task-with-no-instances')
          .then(task => {
            expect(task).toBeUndefined()
          })
      )
    })
  })
}
