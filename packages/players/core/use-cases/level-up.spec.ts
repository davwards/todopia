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
              },
              health: {
                change: '=',
                value: 80
              },
            }
          }
        }
      })
    )

    it('deducts 100 experience', () =>
      levelUp(ledger)('player-a')
        .then(() => ledger.currentStateFor('player-a'))
        .then(state => {
          expect(state.currencies.experience).toEqual(0)
        })
    )

    it('adds one level', () =>
      levelUp(ledger)('player-a')
        .then(() => ledger.currentStateFor('player-a'))
        .then(state => {
          expect(state.currencies.level).toEqual(3)
        })
    )

    it('restores the player to 100 health', () =>
      levelUp(ledger)('player-a')
        .then(() => ledger.currentStateFor('player-a'))
        .then(state => {
          expect(state.currencies.health).toEqual(100)
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
              },
              health: {
                change: '=',
                value: 70
              },
            }
          }
        }
      })
    )

    it('deducts 100 experience', () =>
      levelUp(ledger)('player-a')
        .then(() => ledger.currentStateFor('player-a'))
        .then(state => {
          expect(state.currencies.experience).toEqual(1)
        })
    )

    it('adds one level', () =>
      levelUp(ledger)('player-a')
        .then(() => ledger.currentStateFor('player-a'))
        .then(state => {
          expect(state.currencies.level).toEqual(4)
        })
    )

    it('restores the player to 100 health', () =>
      levelUp(ledger)('player-a')
        .then(() => ledger.currentStateFor('player-a'))
        .then(state => {
          expect(state.currencies.health).toEqual(100)
        })
    )
  })
})


