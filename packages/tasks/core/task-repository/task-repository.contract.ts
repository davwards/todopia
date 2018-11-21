import { TaskRepository, Status } from '../model'

export function taskRepositoryContract(getRepo: () => TaskRepository) {
  let repo: TaskRepository

  beforeEach(() => {
    repo = getRepo()
  })

  describe('behaving like a task repository', () => {
    it('resolves with an id on save which can be used to fetch the todo', () =>
      repo
        .saveTask({
          title: 'Survey ley lines',
          playerId: 'player-a',
          status: Status.INCOMPLETE,
          deadline: '2018-11-05T11:59:59Z',
        })
        .then(id => repo.findTask(id)
          .then(task => {
            expect(task.title).toEqual('Survey ley lines')
            expect(task.playerId).toEqual('player-a')
            expect(task.id).toEqual(id)
            expect(task.deadline).toEqual('2018-11-05T11:59:59Z')
          })
        )
    )

    it('updates tasks that have previously been saved', () =>
      repo
        .saveTask({title: 'Survey ley lines', playerId: 'player-a', status: Status.INCOMPLETE})
        .then(id =>
          repo.saveTask({
            id,
            title: 'Document ley lines',
            playerId: 'player-a',
            status: Status.INCOMPLETE
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
            status: Status.INCOMPLETE
          })
          .then(() => repo.saveTask({
            title: 'Collect reagents',
            playerId: 'player-a',
            status: Status.INCOMPLETE
          }))
          .then(() => repo.saveTask({
            title: 'Tame gryphon',
            playerId: 'player-b',
            status: Status.INCOMPLETE
          }))
          .then(() => repo.saveTask({
            title: 'Delve dungeon',
            playerId: 'player-b',
            status: Status.INCOMPLETE
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
          })
          .then(() => repo.saveTask({
            title: 'Incomplete task with deadline in the past',
            playerId: 'player-a',
            status: Status.INCOMPLETE,
            deadline: '2018-11-05T11:59:59Z',
          }))
          .then(() => repo.saveTask({
            title: 'Completed task with deadline in the past',
            playerId: 'player-a',
            status: Status.COMPLETE,
            deadline: '2018-11-05T11:59:59Z',
          }))
          .then(() => repo.saveTask({
            title: 'Overdue task with deadline in the past',
            playerId: 'player-a',
            status: Status.OVERDUE,
            deadline: '2018-11-05T11:59:59Z',
          }))
          .then(() => repo.saveTask({
            title: 'Incomplete task with deadline right now',
            playerId: 'player-a',
            status: Status.INCOMPLETE,
            deadline: '2018-11-05T12:00:00Z',
          }))
          .then(() => repo.saveTask({
            title: 'Incomplete task with deadline in the future',
            playerId: 'player-a',
            status: Status.INCOMPLETE,
            deadline: '2018-11-05T12:00:01Z',
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
  })
}
