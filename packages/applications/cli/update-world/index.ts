import {
  PlayerRepository,
} from '@todopia/players-core'

import {
  RecurringTaskRepository,
} from '@todopia/tasks-core'

export const updateWorld = (inj: {

  checkDeadlines: (currentTime: string) => Promise<any>,
  resurrectPlayer: (playerId: string) => Promise<any>,
  levelUp: (playerId: string) => Promise<any>,
  spawnRecurringTasks: (recurringTaskId: string, currentTime: string) => Promise<any>,
  playerRepository: PlayerRepository,
  recurringTaskRepository: RecurringTaskRepository,

}) => (

  currentTime: string

): Promise<any> => (

  inj.checkDeadlines(currentTime)
    .then(() => inj.playerRepository.findAllPlayers())
    .then(players => Promise.all(
      players.map(player =>
        inj.levelUp(player.id)
          .then(() => inj.resurrectPlayer(player.id))
          .then(() => inj.recurringTaskRepository
            .findRecurringTasksForPlayer(player.id))
          .then(tasks => Promise.all(tasks.map(task =>
            inj.spawnRecurringTasks(task.id, currentTime)
          )))
      )
    ))

)
