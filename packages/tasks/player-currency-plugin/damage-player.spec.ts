import { Ledger, FakeLedger } from '@todopia/players-core'
import { damagePlayer } from '.'

const INITIAL_HEALTH = 100

describe('damagePlayer', () => {
  let ledger: Ledger = null

  beforeEach(() => {
    ledger = FakeLedger()
  })

  it('deducts health from the player', () =>
    resetPlayerHealth('player-a')
      .then(() => damagePlayer(ledger)('player-a', 1))
      .then(() => ledger.currentStateFor('player-a'))
      .then(state =>
        expect(state.currencies.health).toBeLessThan(INITIAL_HEALTH)
      )
  )

  it('does more damage for tasks with higher magnitude', () => {
    let healthAfterDamage1: number = null

    let healthAfterDamage2: number = null

    return resetPlayerHealth('player-a')
      .then(() => damagePlayer(ledger)('player-a', 1))
      .then(() => ledger.currentStateFor('player-a'))
      .then(state =>
        healthAfterDamage1 = state.currencies.health
      )

      .then(() => resetPlayerHealth('player-a'))
      .then(() => damagePlayer(ledger)('player-a', 2))
      .then(() => ledger.currentStateFor('player-a'))
      .then(state =>
        healthAfterDamage2 = state.currencies.health
      )

      .then(() =>
        expect(healthAfterDamage1)
          .toBeGreaterThan(healthAfterDamage2)
      )

  })

  function resetPlayerHealth(playerId: string) {
    return ledger.addTransaction({
      comment: `resetting ${playerId}`,
      changes: {
        [playerId]: {
          currencies: {
            health: { change: '=', value: INITIAL_HEALTH },
          },
        },
      },
    })
  }
})
