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
