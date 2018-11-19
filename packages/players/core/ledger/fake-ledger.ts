import { CurrentPlayerState, LedgerEntry } from '../model'
import { currentStateReducer } from './current-state-reducer'
import { initialPlayerState } from './initial-player-state'

export const FakeLedger = () => {
  const entries: LedgerEntry[] = []

  return {
    currentStateFor: (playerId: string) =>
      Promise.resolve(
        entries.reduce(
          currentStateReducer, {}
        )[playerId] || initialPlayerState()
      ),

    addTransaction: (entry: LedgerEntry) => {
      entries.push(entry)
      return Promise.resolve()
    }
  }
}
