import { RecurringTaskRepository, Status } from '../model'

export function recurringTaskRepositoryContract(getRepo: () => RecurringTaskRepository) {
  let repo: RecurringTaskRepository

  beforeEach(() => {
    repo = getRepo()
  })

  describe('behaving like a task repository', () => {
    it('resolves with an id on save which can be used to fetch the recurring task', () =>
      repo
        .saveRecurringTask({
          title: 'Survey ley lines',
          playerId: 'player-a',
          cadence: 'RRULE:FREQ=DAILY;INTERVAL=2',
          duration: 'P1D'
        })
        .then(id => repo.findRecurringTask(id)
          .then(task => {
            expect(task.title).toEqual('Survey ley lines')
            expect(task.playerId).toEqual('player-a')
            expect(task.cadence).toEqual('RRULE:FREQ=DAILY;INTERVAL=2')
            expect(task.duration).toEqual('P1D')
            expect(task.id).toEqual(id)
          })
        )
    )

    it('updates tasks that have previously been saved', () =>
      repo
        .saveRecurringTask({
          title: 'Survey ley lines',
          playerId: 'player-a',
          cadence: 'RRULE:FREQ=DAILY;INTERVAL=2',
          duration: 'P1D'
        })
        .then(id =>
          repo.saveRecurringTask({
            id,
            title: 'Document ley lines',
            playerId: 'player-a',
            cadence: 'RRULE:FREQ=DAILY;INTERVAL=2',
            duration: 'P1D'
          })
          .then(newId => expect(newId).toEqual(id))
          .then(() => repo.findRecurringTask(id))
        )
        .then(task => expect(task.title).toEqual('Document ley lines'))
    )

    describe('when asked to fetch a task id it doesnt recognize', () => {
      it('throws an error', () =>
        repo.findRecurringTask('nonsense-task-id')
          .then(task => { fail('Promise should have rejected!') })
          .catch(error => { 
            expect(error).toEqual(
              'No recurring task found with id: nonsense-task-id'
            )
          })
      )
    })

    describe('fetching recurring tasks for a player', () => {
      beforeEach(() =>
        repo
          .saveRecurringTask({
            title: 'player-a task 1',
            playerId: 'player-a',
            cadence: 'RRULE:FREQ=DAILY;INTERVAL=2',
            duration: 'P1D'
          })
          .then(() =>
            repo.saveRecurringTask({
              title: 'player-a task 2',
              playerId: 'player-a',
              cadence: 'RRULE:FREQ=DAILY;INTERVAL=2',
              duration: 'P1D'
            })
          )
          .then(() =>
            repo.saveRecurringTask({
              title: 'player-b task 1',
              playerId: 'player-b',
              cadence: 'RRULE:FREQ=DAILY;INTERVAL=2',
              duration: 'P1D'
            })
          )
      )

      it('returns all recurring tasks with the given player id', () =>
        repo.findRecurringTasksForPlayer('player-a')
          .then(tasks => tasks.map(task => task.title))
          .then(titles =>{
            expect(titles).toContain('player-a task 1')
            expect(titles).toContain('player-a task 2')
            expect(titles).not.toContain('player-b task 1')
          })
      )
    })
  })
}
