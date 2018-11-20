import {
  Ledger,
  FakeLedger,
  levelUp,
} from '..'

describe('Resurrecting a new player', () => {
  let ledger: Ledger = null

  beforeEach(() => {
    ledger = FakeLedger()
  })

  describe('when the player has < 100 experience', () => {
    beforeEach(() =>
      ledger.addTransaction({
        comment: 'given a player with experience < 100',
        changes: {
          'player-a': {
            currencies: {
              experience: {
                change: '=',
                value: 99
              },
              level: {
                change: '=',
                value: 2
              }
            }
          }
        }
      })
    )

    it('does nothing', () =>
      levelUp(ledger)('player-a')
        .then(() => ledger.currentStateFor('player-a'))
        .then(state => {
          expect(state.currencies.experience).toEqual(99)
          expect(state.currencies.level).toEqual(2)
        })
    )
  })

  describe('when the player has 100 experience', () => {
    beforeEach(() =>
      ledger.addTransaction({
        comment: 'given a player with experience == 100',
        changes: {
          'player-a': {
            currencies: {
              experience: {
                change: '=',
                value: 100
              },
              level: {
                change: '=',
                value: 2
              }
            }
          }
        }
      })
    )

    it('deducts 100 experience and adds one level', () =>
      levelUp(ledger)('player-a')
        .then(() => ledger.currentStateFor('player-a'))
        .then(state => {
          expect(state.currencies.experience).toEqual(0)
          expect(state.currencies.level).toEqual(3)
        })
    )
  })

  describe('when the player more than 100 experience', () => {
    beforeEach(() =>
      ledger.addTransaction({
        comment: 'given a player with experience == 100',
        changes: {
          'player-a': {
            currencies: {
              experience: {
                change: '=',
                value: 101
              },
              level: {
                change: '=',
                value: 3
              }
            }
          }
        }
      })
    )

    it('deducts 100 experience and adds one level', () =>
      levelUp(ledger)('player-a')
        .then(() => ledger.currentStateFor('player-a'))
        .then(state => {
          expect(state.currencies.experience).toEqual(1)
          expect(state.currencies.level).toEqual(4)
        })
    )
  })
})


