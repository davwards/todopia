import { updateWorld } from '.'

import {
  PlayerRepository,
  FakePlayerRepository,
} from '@todopia/players-core'

describe('Todopia CLI', () => {
  let checkDeadlines
  let resurrectPlayer
  let playerRepository: PlayerRepository
  let now

  beforeEach(() => {
    checkDeadlines = jest.fn(() => Promise.resolve())
    resurrectPlayer = jest.fn(() => Promise.resolve())
    playerRepository = FakePlayerRepository()

    now = '2018-11-05T12:59:59.001Z'

    return playerRepository
      .savePlayer({id: 'player-a', name: 'Player A'})
      .then(() => playerRepository
        .savePlayer({id: 'player-b', name: 'Player B'})
      )
  })

  it('checks deadlines', () =>
    updateWorld({
      checkDeadlines,
      resurrectPlayer,
      playerRepository
    })(now).then(() =>
      expect(checkDeadlines).toHaveBeenCalledWith(now)
    )
  )

  it('checks each player for resurrection', () =>
    updateWorld({
      checkDeadlines,
      resurrectPlayer,
      playerRepository
    })(now).then(() => {
      expect(resurrectPlayer).toHaveBeenCalledWith('player-a')
      expect(resurrectPlayer).toHaveBeenCalledWith('player-b')
    })
  )
})

