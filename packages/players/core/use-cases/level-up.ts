import { Ledger } from '../model'

export const levelUp = (
  
  ledger: Ledger,
  
) => (
  
  playerId: string

) => (

  ledger.currentStateFor(playerId)
    .then(state => {
      if(state.currencies.experience >= 100) {
        return ledger.addTransaction({
          comment: `leveling up ${playerId}`,
          changes: {
            [playerId]: {
              currencies: {
                experience: { change: '$', value: 100, },
                level: { change: '+', value: 1, },
              }
            }
          }
        })
      }
    })

)
