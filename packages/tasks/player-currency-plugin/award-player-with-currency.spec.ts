import { Ledger, FakeLedger } from '@todopia/players-core'
import { awardPlayerWithCurrency } from '.'

describe('awardPlayerWithCurrency', () => {
  let ledger: Ledger = null

  beforeEach(() => {
    ledger = FakeLedger()
  })

  it('awards coin and xp to the player', () =>
    resetPlayerCoinAndXp('player-a')
      .then(() => awardPlayerWithCurrency(ledger)('player-a', 1))
      .then(() => ledger.currentStateFor('player-a'))
      .then(state => {
        expect(state.currencies.experience).toBeGreaterThan(0)
        expect(state.currencies.coin).toBeGreaterThan(0)
      })
  )

  it('awards more coin and xp for tasks with higher magnitude', () => {
    let xpAwardForMagnitude1: number = null
    let coinAwardForMagnitude1: number = null

    let xpAwardForMagnitude2: number = null
    let coinAwardForMagnitude2: number = null

    return resetPlayerCoinAndXp('player-a')
      .then(() => awardPlayerWithCurrency(ledger)('player-a', 1))
      .then(() => ledger.currentStateFor('player-a'))
      .then(state => {
        xpAwardForMagnitude1 = state.currencies.experience
        coinAwardForMagnitude1 = state.currencies.coin
      })

      .then(() => resetPlayerCoinAndXp('player-a'))
      .then(() => awardPlayerWithCurrency(ledger)('player-a', 2))
      .then(() => ledger.currentStateFor('player-a'))
      .then(state => {
        xpAwardForMagnitude2 = state.currencies.experience
        coinAwardForMagnitude2 = state.currencies.coin
      })

      .then(() => {
        expect(xpAwardForMagnitude2)
          .toBeGreaterThan(xpAwardForMagnitude1)
        expect(coinAwardForMagnitude2)
          .toBeGreaterThan(coinAwardForMagnitude1)
      })

  })

  function resetPlayerCoinAndXp(playerId: string) {
    return ledger.addTransaction({
      comment: `resetting ${playerId}`,
      changes: {
        [playerId]: {
          currencies: {
            experience: { change: '=', value: 0 },
            coin: { change: '=', value: 0 },
          },
        },
      },
    })
  }
})
