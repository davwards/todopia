import { LedgerEntry, CurrentPlayerState } from '../model'
import { initialPlayerState } from './initial-player-state'

export const currentStateReducer =
  (state: CurrentStateForAllPlayers, entry: LedgerEntry) => {
    const originalState = JSON.parse(JSON.stringify(state))
    let abortTransaction = false

    Object.keys(entry.changes).forEach(playerId => {
      if(!state[playerId]) state[playerId] = initialPlayerState()

      if(entry.changes[playerId].currencies) {
        Object.keys(entry.changes[playerId].currencies).forEach(currency => {
          switch(entry.changes[playerId].currencies[currency].change) {

            case '=':
              state[playerId].currencies[currency] =
                entry.changes[playerId].currencies[currency].value
              break

            case '+':
              state[playerId].currencies[currency] =
                (state[playerId].currencies[currency] || 0) +
                  entry.changes[playerId].currencies[currency].value
              break

            case '-':
              state[playerId].currencies[currency] =
                (state[playerId].currencies[currency] || 0) -
                  entry.changes[playerId].currencies[currency].value

              if(state[playerId].currencies[currency] < 0) {
                state[playerId].currencies[currency] = 0
              }

              break

            case '$':
              state[playerId].currencies[currency] =
                (state[playerId].currencies[currency] || 0) -
                  entry.changes[playerId].currencies[currency].value

              if(state[playerId].currencies[currency] < 0) {
                abortTransaction = true
              }

              break
          }
        })
      }
    })

    return abortTransaction ? originalState : state
  }

interface CurrentStateForAllPlayers {
  [playerId: string]: CurrentPlayerState
}
