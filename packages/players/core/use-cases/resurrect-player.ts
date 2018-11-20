import { Ledger } from '../model'

export const resurrectPlayer = (
  
  ledger: Ledger,
  
) => (
  
  playerId: string

) => (

  ledger.currentStateFor(playerId)
    .then(state => {
      if(state.currencies.health > 0) return

      return ledger.addTransaction({
        comment: `resurrecting ${playerId}`,
        changes: {
          [playerId]: {
            currencies: {
              health: { change: '=', value: 100 },
              coin: { change: '=', value: 0, },
              experience: { change: '=', value: 0, },
            }
          }
        }
      })
    })

)
