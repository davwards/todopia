import { Ledger } from '../model'

export const createPlayer = (
  
  ledger: Ledger
  
) => (
  
  playerId: string

) =>
  
  ledger.addTransaction({
    comment: `creating player ${playerId}`,
    changes: {
      [playerId]: {
        currencies: {
          health: {
            change: '=',
            value: 100
          },
          coin: {
            change: '=',
            value: 20
          },
          experience: {
            change: '=',
            value: 0
          },
        }
      }
    }
  })
