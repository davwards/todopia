import { TaskRepository, Status } from '@todopia/tasks-core'
import { PlayerRepository } from '@todopia/players-core'
import { Session } from './model'

export const Cli = (inj: {

  session: Session,

  createPlayer: (name: string) => Promise<string>,

  createTask: (
    playerId: string,
    title: string,
    deadline?: string
  ) => Promise<string>,

  completeTask: (taskId: string) => Promise<string>,

  taskRepository: TaskRepository,

  playerRepository: PlayerRepository,

  ui: {
    choice: (prompt: string, choices: string[]) => Promise<string>
  }

}) => (

  argv: string[],

): Promise<any> => {

  if(argv[0] === 'login') {
    return inj.playerRepository.findAllPlayers()
      .then(players => players.length === 1
        ? inj.session.login(players[0].id)
        : inj.ui.choice('Which player?', players.map(player =>
            player.name
          )).then(choiceIndex =>
            inj.session.login(players[choiceIndex].id)
          )
      )
  }

  if(argv[0] === 'player') {
    inj.createPlayer(argv[2])
    return Promise.resolve()
  }

  if(argv[0] === 'task') {
    if(argv[1] === 'create') {
      return inj.session.currentPlayer()
        .then(playerId => argv[3] === '--deadline'
          ? inj.createTask(playerId, argv[2], argv[4])
          : inj.createTask(playerId, argv[2])
        )
    }

    if(argv[1] === 'complete') {
      return inj.session.currentPlayer()
        .then(playerId => inj.taskRepository
          .findAllCompletableTasksForPlayer(playerId))
        .then(tasks =>
          inj.ui.choice('Which task?', tasks.map(task =>
            [
              task.title,
              task.deadline ? ` (due ${task.deadline})` : '',
              task.status === Status.OVERDUE ? '!!' : '',
            ].join('')
          )).then(choiceIndex => tasks[choiceIndex].id))
        .then(taskId => inj.completeTask(taskId))
    }
  }

  return Promise.resolve()
}
