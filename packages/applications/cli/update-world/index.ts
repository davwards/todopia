import { PlayerRepository } from '@todopia/players-core'

export const updateWorld = (inj: {

  checkDeadlines: (currentTime: string) => Promise<any>,
  resurrectPlayer: (playerId: string) => Promise<any>,
  levelUp: (playerId: string) => Promise<any>,
  playerRepository: PlayerRepository,

}) => (

  currentTime: string

): Promise<any> => (

  inj.checkDeadlines(currentTime)
    .then(() => inj.playerRepository.findAllPlayers())
    .then(players => Promise.all(
      players.map(player =>
        inj.levelUp(player.id)
          .then(() => inj.resurrectPlayer(player.id))
      )
    ))

)
