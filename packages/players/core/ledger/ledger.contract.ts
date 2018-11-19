import { Ledger } from '../model'

export function ledgerContract(getLedger: () => Ledger) {
  let ledger: Ledger = null

  beforeEach(() => {
    ledger = getLedger()
  })

  describe('behaving like a Ledger', () => {
    describe('when no transactions have happened for a player', () => {
      it('gives an empty initial state', () =>
        ledger.currentStateFor('player-a')
          .then(state => expect(state).toEqual({
            currencies: {}
          }))
      )
    })

    describe('different transaction types', () => {
      it('reduce correctly according to the specified change type', () =>
        ledger
          .addTransaction({
            comment: 'initial values',
            changes: {
              'player-a': {
                currencies: {
                  health: {
                    change: '+',
                    value: 10
                  },
                  coin: {
                    change: '+',
                    value: 20
                  },
                  experience: {
                    change: '+',
                    value: 30
                  },
                }
              }
            }
          })
          .then(() => ledger.currentStateFor('player-a'))
          .then(state => {
            expect(state.currencies.health).toEqual(10)
            expect(state.currencies.coin).toEqual(20)
            expect(state.currencies.experience).toEqual(30)
          })
          .then(() => ledger.addTransaction({
            comment: 'add to currencies',
            changes: {
              'player-a': {
                currencies: {
                  health: {
                    change: '+',
                    value: 1
                  },
                  coin: {
                    change: '+',
                    value: 2
                  },
                  experience: {
                    change: '+',
                    value: 3
                  },
                }
              }
            }
          }))
          .then(() => ledger.currentStateFor('player-a'))
          .then(state => {
            expect(state.currencies.health).toEqual(11)
            expect(state.currencies.coin).toEqual(22)
            expect(state.currencies.experience).toEqual(33)
          })
          .then(() => ledger.addTransaction({
            comment: 'set currencies to given value',
            changes: {
              'player-a': {
                currencies: {
                  health: {
                    change: '=',
                    value: 5
                  },
                  coin: {
                    change: '=',
                    value: 6
                  },
                  experience: {
                    change: '=',
                    value: 7
                  },
                }
              }
            }
          }))
          .then(() => ledger.currentStateFor('player-a'))
          .then(state => {
            expect(state.currencies.health).toEqual(5)
            expect(state.currencies.coin).toEqual(6)
            expect(state.currencies.experience).toEqual(7)
          })
          .then(() => ledger.addTransaction({
            comment: 'subtract from currencies',
            changes: {
              'player-a': {
                currencies: {
                  health: {
                    change: '-',
                    value: 1
                  },
                  coin: {
                    change: '-',
                    value: 1
                  },
                  experience: {
                    change: '-',
                    value: 1
                  },
                }
              }
            }
          }))
          .then(() => ledger.currentStateFor('player-a'))
          .then(state => {
            expect(state.currencies.health).toEqual(4)
            expect(state.currencies.coin).toEqual(5)
            expect(state.currencies.experience).toEqual(6)
          })
          .then(() => ledger.addTransaction({
            comment: 'subtract more from currencies than they currently contain',
            changes: {
              'player-a': {
                currencies: {
                  health: {
                    change: '-',
                    value: 100
                  },
                  coin: {
                    change: '-',
                    value: 100
                  },
                  experience: {
                    change: '-',
                    value: 100
                  },
                }
              }
            }
          }))
          .then(() => ledger.currentStateFor('player-a'))
          .then(state => {
            expect(state.currencies.health).toEqual(0)
            expect(state.currencies.coin).toEqual(0)
            expect(state.currencies.experience).toEqual(0)
          })
      )
    })
  })
}
