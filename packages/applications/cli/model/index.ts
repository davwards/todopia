export interface Session {
  login: (name: string) => Promise<void>
  currentPlayer: () => Promise<string>
}
