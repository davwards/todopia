import {
  completeTask,
  createTask,
  Status,
  FakeTaskRepository
} from '..'

describe('Completing tasks', () => {
  let taskRepository = null
  let awards = null

  beforeEach(() => {
    awards = FakeAwards()
    taskRepository = FakeTaskRepository()
  })

  it('awards the player a prize', () => {
    const initialPlayerAward = awards.currentAward('player-a')

    return createTask(taskRepository)('player-a', 'Test Task')
      .then(id => completeTask(taskRepository, awards.awardPrize)(id))
      .then(() => expect(awards.currentAward('player-a')).toBeGreaterThan(initialPlayerAward))
  })

  it('marks the task as complete', () =>
    createTask(taskRepository)('player-a', 'Survey ley lines')
      .then(id => completeTask(taskRepository, awards.awardPrize)(id)
        .then(() => taskRepository.findTask(id))
      )
      .then(task => {
        expect(task.status).toEqual(Status.COMPLETE)
      })
  )

  describe('when the task is already completed', () => {
    let taskId: string = null
    let awardAfterInitialCompletion: number = null

    beforeEach(() =>
      createTask(taskRepository)('player-a', 'Survey ley lines')
        .then(id => taskId = id)
        .then(id => completeTask(taskRepository, awards.awardPrize)(id))
        .then(() =>
          awardAfterInitialCompletion = awards.currentAward('player-a')
        )
    )

    it('does not award the player again', () =>
      completeTask(taskRepository, awards.awardPrize)(taskId)
        .then(() => expect(
          awards.currentAward('player-a')
        ).toEqual(awardAfterInitialCompletion))
    )
  })

  describe('when the task is overdue', () => {
    let taskId: string = null
    let initialAward: number = null

    beforeEach(() =>
      taskRepository
        .saveTask({
          title: 'Survey ley lines',
          playerId: 'player-a',
          status: Status.OVERDUE,
          deadline: '2018-11-05T11:00:00Z',
        })
        .then(id => taskId = id)
        .then(() => initialAward = awards.currentAward('player-a'))
    )

    it('awards the player a prize', () =>
      completeTask(taskRepository, awards.awardPrize)(taskId)
        .then(() => expect(
          awards.currentAward('player-a')
        ).toBeGreaterThan(initialAward))
    )
  })

  function FakeAwards() {
    const _awards: {[playerId: string]: number} = {}
    const currentAward = playerId => _awards[playerId] || 0

    return {
      awardPrize: (playerId: string, award: number) => {
        _awards[playerId] = currentAward(playerId) + award
        return Promise.resolve()
      },
      currentAward
    }
  }
})

