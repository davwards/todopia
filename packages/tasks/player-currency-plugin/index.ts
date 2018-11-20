import { Ledger } from '@todopia/players-core'

export const awardPlayerWithCurrency = (

  ledger: Ledger

) => (

  playerId: string,
  prize: number

) => (

  ledger.addTransaction({
    comment: `rewarding ${playerId} for task completion`,
    changes: {
      [playerId]: {
        currencies: {
          experience: { change: '+', value: 10 * prize },
          coin: { change: '+', value: 5 * prize },
        },
      },
    },
  })

)
