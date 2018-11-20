import {
  Ledger,
  FakeLedger,
  PlayerRepository,
  FakePlayerRepository,
  createPlayer,
} from '..'

describe('Creating a new player', () => {
  let ledger: Ledger = null
  let playerRepo: PlayerRepository = null

  beforeEach(() => {
    ledger = FakeLedger()
    playerRepo = FakePlayerRepository()
  })

  it('saves the player to the repository and resolves with their id', () =>
    createPlayer(playerRepo, ledger)('talapas')
      .then(id => playerRepo.findPlayer(id))
      .then(player => expect(player.name).toEqual('talapas'))
  )

  it('adds a set of initial currencies to the ledger', () =>
    createPlayer(playerRepo, ledger)('talapas')
      .then(id => ledger.currentStateFor(id))
      .then(state => {
        expect(state.currencies.health).toEqual(100)
        expect(state.currencies.coin).toEqual(20)
        expect(state.currencies.experience).toEqual(0)
      })
  )
})
