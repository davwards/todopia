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


export const damagePlayer = (

  ledger: Ledger,

) => (

  playerId: string,
  damage: number

) => (

  ledger.addTransaction({
    comment: `penalizing ${playerId} for missed deadline`,
    changes: {
      [playerId]: {
        currencies: {
          health: { change: '-', value: 5 * damage },
        },
      },
    },
  })

)
