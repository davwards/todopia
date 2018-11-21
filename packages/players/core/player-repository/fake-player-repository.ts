import { Player } from '../model'

export const FakePlayerRepository = () => {
  const players = {}

  return {
    savePlayer: (player: Player) => {
      const id = player.id || Math.round(Math.random() * 100000).toString()
      players[id] = Object.assign({}, player, {id})
      return Promise.resolve(id)
    },

    findPlayer: (playerId: string) => players[playerId]
      ? Promise.resolve(players[playerId])
      : Promise.reject(`No player found with id: ${playerId}`),

    findAllPlayers: () => Promise.resolve(
      Object.keys(players).map(id => players[id])
    )
  }
}
