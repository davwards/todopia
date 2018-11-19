import { Ledger, FakeLedger, createPlayer } from '..'

describe('Creating a new player', () => {
  let ledger: Ledger = null

  beforeEach(() => {
    ledger = FakeLedger()
  })

  it('adds a set of initial currencies to the ledger', () =>
    createPlayer(ledger)('player-a')
      .then(() => ledger.currentStateFor('player-a'))
      .then(state => {
        expect(state.currencies.health).toEqual(100)
        expect(state.currencies.coin).toEqual(20)
        expect(state.currencies.experience).toEqual(0)
      })
  )
})
