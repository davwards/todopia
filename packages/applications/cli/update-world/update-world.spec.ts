import { updateWorld } from '.'

import {
  PlayerRepository,
  FakePlayerRepository,
} from '@todopia/players-core'

import {
  RecurringTaskRepository,
  FakeRecurringTaskRepository,
} from '@todopia/tasks-core'

describe('Todopia CLI', () => {
  let checkDeadlines
  let resurrectPlayer
  let levelUp
  let spawnRecurringTasks
  let playerRepository: PlayerRepository
  let recurringTaskRepository: RecurringTaskRepository
  let now
  let usecase

  beforeEach(() => {
    checkDeadlines = jest.fn(() => Promise.resolve())
    resurrectPlayer = jest.fn(() => Promise.resolve())
    levelUp = jest.fn(() => Promise.resolve())
    spawnRecurringTasks = jest.fn(() => Promise.resolve())
    playerRepository = FakePlayerRepository()
    recurringTaskRepository = FakeRecurringTaskRepository()

    now = '2018-11-05T12:59:59.001Z'

    usecase = updateWorld({
      checkDeadlines,
      resurrectPlayer,
      levelUp,
      spawnRecurringTasks,
      playerRepository,
      recurringTaskRepository,
    })

    return playerRepository.savePlayer({
        id: 'player-a',
        name: 'Player A'
      })
      .then(() => playerRepository.savePlayer({
        id: 'player-b',
        name: 'Player B'
      }))
      .then(() => recurringTaskRepository.saveRecurringTask({
        id: 'recurring-task-1',
        title: 'Recurring Task 1',
        cadence: 'something',
        duration: 'something',
        playerId: 'player-a',
      }))
      .then(() => recurringTaskRepository.saveRecurringTask({
        id: 'recurring-task-2',
        title: 'Recurring Task 2',
        cadence: 'something',
        duration: 'something',
        playerId: 'player-b',
      }))
  })

  it('checks deadlines', () =>
    usecase(now).then(() =>
      expect(checkDeadlines).toHaveBeenCalledWith(now)
    )
  )

  it('checks each player for resurrection', () =>
    usecase(now).then(() => {
      expect(resurrectPlayer).toHaveBeenCalledWith('player-a')
      expect(resurrectPlayer).toHaveBeenCalledWith('player-b')
    })
  )

  it('checks each player for level up', () =>
    usecase(now).then(() => {
      expect(levelUp).toHaveBeenCalledWith('player-a')
      expect(levelUp).toHaveBeenCalledWith('player-b')
    })
  )

  it('checks whether any recurring tasks need to spawn', () =>
    usecase(now).then(() => {
      expect(spawnRecurringTasks).toHaveBeenCalledWith('recurring-task-1', now)
      expect(spawnRecurringTasks).toHaveBeenCalledWith('recurring-task-2', now)
    })
  )
})

