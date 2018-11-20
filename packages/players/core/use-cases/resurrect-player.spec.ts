import {
  Ledger,
  FakeLedger,
  resurrectPlayer,
} from '..'

describe('Resurrecting a new player', () => {
  let ledger: Ledger = null

  beforeEach(() => {
    ledger = FakeLedger()
  })

  describe('when the player is alive', () => {
    beforeEach(() =>
      ledger.addTransaction({
        comment: 'given a player with health > 0 and various other currencies',
        changes: {
          'player-a': {
            currencies: {
              health: {
                change: '=',
                value: 1
              },
              coin: {
                change: '=',
                value: 7
              },
              experience: {
                change: '=',
                value: 11
              }
            }
          }
        }
      })
    )

    it('does nothing', () =>
      resurrectPlayer(ledger)('player-a')
        .then(() => ledger.currentStateFor('player-a'))
        .then(state => {
          expect(state.currencies.health).toEqual(1)
          expect(state.currencies.coin).toEqual(7)
          expect(state.currencies.experience).toEqual(11)
        })
    )
  })

  describe('when the player is dead', () => {
    beforeEach(() =>
      ledger.addTransaction({
        comment: 'given a player with health == 0 and various other currencies',
        changes: {
          'player-a': {
            currencies: {
              health: {
                change: '=',
                value: 0
              },
              coin: {
                change: '=',
                value: 7
              },
              experience: {
                change: '=',
                value: 11
              },
              anyArbitraryCurrency: {
                change: '=',
                value: 9
              }
            }
          }
        }
      })
    )

    it('resets health, clears coin and experience, and leaves other currencies alone', () =>
      resurrectPlayer(ledger)('player-a')
        .then(() => ledger.currentStateFor('player-a'))
        .then(state => {
          expect(state.currencies.health).toEqual(100)
          expect(state.currencies.coin).toEqual(0)
          expect(state.currencies.experience).toEqual(0)
          expect(state.currencies.anyArbitraryCurrency).toEqual(9)
        })
    )
  })
})

