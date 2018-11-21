export interface Ledger {
  currentStateFor(playerId: string): Promise<CurrentPlayerState>
  addTransaction(entry: LedgerEntry)
}

export interface CurrentPlayerState {
  currencies: {
    [name: string]: number
  }
}

export interface CurrencyChange {
  change: '+' | '-' | '='
  value: number
}

export interface LedgerEntry {
  comment: string
  changes: {
    [playerId: string]: {
      currencies?: {
        [name: string]: CurrencyChange
      }
    }
  }
}

export interface Player {
  name: string
  id?: string
}

export interface PlayerRepository {
  savePlayer(player: Player): Promise<string>
  findPlayer(playerId: string): Promise<Player>
  findAllPlayers(): Promise<Player[]>
}
