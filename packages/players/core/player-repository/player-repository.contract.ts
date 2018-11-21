import { PlayerRepository } from '../model'

export function playerRepositoryContract(getRepo: () => PlayerRepository) {
  let repo: PlayerRepository

  beforeEach(() => {
    repo = getRepo()
  })

  describe('behaving like a player repository', () => {
    it('resolves with an id on save which can be used to fetch the player', () =>
      repo
        .savePlayer({
          name: 'talapas',
        })
        .then(id => repo.findPlayer(id)
          .then(player => {
            expect(player.name).toEqual('talapas')
          })
        )
    )

    it('updates players that have previously been saved', () =>
      repo
        .savePlayer({name: 'old name'})
        .then(id =>
          repo.savePlayer({
            id,
            name: 'new name',
          })
          .then(newId => expect(newId).toEqual(id))
          .then(() => repo.findPlayer(id))
        )
        .then(player => expect(player.name).toEqual('new name'))
    )

    describe('when asked to fetch a player id it doesnt recognize', () => {
      it('throws an error', () =>
        repo.findPlayer('nonsense-player-id')
          .then(task => { fail('Promise should have rejected!') })
          .catch(error => { expect(error).toEqual('No player found with id: nonsense-player-id') })
      )
    })

    it('fetches all players', () => {
      let firstId: string
      let secondId: string

      return repo.savePlayer({name: 'first'})
        .then(id => firstId = id)
        .then(() => repo.savePlayer({name: 'second'}))
        .then(id => secondId = id)
        .then(() => repo.findAllPlayers())
        .then(players => {
          expect(
            players.find(player => player.id === firstId)
          ).toEqual({id: firstId, name: 'first'})

          expect(
            players.find(player => player.id === secondId)
          ).toEqual({id: secondId, name: 'second'})
        })
    })
  })
}
