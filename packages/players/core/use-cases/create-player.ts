import { Ledger, PlayerRepository } from '../model'

export const createPlayer = (
  
  playerRepository: PlayerRepository,
  ledger: Ledger,
  
) => (
  
  playerName: string

) => (
  
  playerRepository
    .savePlayer({name: playerName})
    .then(playerId => ledger.addTransaction({
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
            level: {
              change: '=',
              value: 1
            },
          }
        }
      }
    }).then(() => playerId))

)
