import {
  createTask,
  checkDeadlines,
  Status,
  FakeTaskRepository
} from '..'

describe('Checking deadlines', () => {
  let taskRepository = null
  let penalizePlayer = null
  const now = '2018-11-05T12:00:00Z'

  beforeEach(() => {
    taskRepository = FakeTaskRepository()
    penalizePlayer = FakePenalties()
  })

  describe('when a task has no deadline', () => {
    beforeEach(() =>
      createTask(taskRepository)('player-a', 'Survey ley lines')
    )

    itDoesNotPenalizeThePlayer()
  })

  describe('when a task has a deadline in the future', () => {
    givenATaskWithDeadline('2018-11-05T12:00:01Z')
    itDoesNotPenalizeThePlayer()
  })

  describe('when a task has a deadline in the past', () => {
    givenATaskWithDeadline('2018-11-05T11:59:59Z')

    itPenalizesThePlayer()

    describe('but the player has already been penalized for it', () => {
      let penaltyAfterInitialDeadlineCheck: number = null

      beforeEach(() =>
        checkDeadlines(taskRepository, penalizePlayer.penalize)(now)
          .then(() => penaltyAfterInitialDeadlineCheck =
            penalizePlayer.currentPenalty('player-a')
          )
      )

      it('does not penalize the player again', () =>
        checkDeadlines(taskRepository, penalizePlayer.penalize)(now)
          .then(() => expect(
            penalizePlayer.currentPenalty('player-a')
          ).toEqual(penaltyAfterInitialDeadlineCheck))
      )
    })
  })

  describe('when a task has a deadline exactly now', () => {
    givenATaskWithDeadline(now)
    itDoesNotPenalizeThePlayer()
  })

  function itDoesNotPenalizeThePlayer() {
    it('does not penalize the player', () =>
      checkDeadlines(taskRepository, penalizePlayer.penalize)(now)
        .then(() => expect(
          penalizePlayer.currentPenalty('player-a')
        ).toEqual(0))
    )
  }

  function itPenalizesThePlayer() {
    it('does not penalize the player', () => {
      const initialPenalty = penalizePlayer.currentPenalty('player-a')

      return checkDeadlines(taskRepository, penalizePlayer.penalize)(now)
        .then(() => expect(
          penalizePlayer.currentPenalty('player-a')
        ).toBeGreaterThan(initialPenalty))
    })
  }

  function givenATaskWithDeadline(deadline: string) {
    beforeEach(() =>
      createTask(taskRepository)(
        'player-a',
        'Survey ley lines',
        deadline
      )
    )
  }

  function FakePenalties() {
    const _penalties: {[playerId: string]: number} = {}
    const currentPenalty = playerId => _penalties[playerId] || 0

    return {
      penalize: (playerId: string, penalty: number) => {
        _penalties[playerId] = currentPenalty(playerId) + penalty
        return Promise.resolve()
      },
      currentPenalty
    }
  }
})

