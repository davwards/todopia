import { TaskRepository, Status, Task } from '@todopia/tasks-core'
import { PlayerRepository, Ledger } from '@todopia/players-core'
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

  checkDeadlines: (currentTime: string) => Promise<any>,

  taskRepository: TaskRepository,

  playerRepository: PlayerRepository,

  ledger: Ledger,

  ui: {
    choice: (prompt: string, choices: string[]) => Promise<string>
    print: (text: string) => void
  },

  now: () => string

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
      ).then(() => inj.checkDeadlines(inj.now()))
  }

  if(argv[0] === 'player') {
    if(argv[1] === 'create') {
      inj.createPlayer(argv[2])
      return Promise.resolve()
    }

    if(argv[1] === 'info') {
      return inj.session.currentPlayer()
        .then(id => inj.playerRepository.findPlayer(id))
        .then(player => {
          inj.ledger.currentStateFor(player.id)
            .then(playerState => {
              inj.ui.print('')
              inj.ui.print(`Player: ${player.name}`)
              Object.keys(playerState.currencies).sort().forEach(currency => {
                inj.ui.print(
                  `  ${currency}: ${playerState.currencies[currency]}`
                )
              })
              inj.ui.print('')
            })
        })
    }
  }

  if(argv[0] === 'task') {
    if(argv[1] === 'create') {
      return inj.session.currentPlayer()
        .then(playerId => argv[3] === '--deadline'
          ? inj.createTask(playerId, argv[2], argv[4])
          : inj.createTask(playerId, argv[2])
        )
    }

    if(argv[1] === 'list') {
      return inj.session.currentPlayer()
        .then(playerId =>
          inj.taskRepository
            .findAllCompletableTasksForPlayer(playerId)
        )
        .then(tasks => {
          inj.ui.print('')
          tasks.forEach(task => inj.ui.print(displayTask(task)))
          inj.ui.print('')
        })
    }

    if(argv[1] === 'complete') {
      return inj.session.currentPlayer()
        .then(playerId => inj.taskRepository
          .findAllCompletableTasksForPlayer(playerId)
        )
        .then(tasks =>
          inj.ui.choice(
            'Which task?',
            tasks.map(displayTask)
          ).then(choiceIndex => tasks[choiceIndex].id)
        )
        .then(taskId => inj.completeTask(taskId))
    }
  }

  return Promise.resolve()
}

const displayTask = (task: Task) =>
  [
    task.title,
    task.deadline ? ` (due ${task.deadline})` : '',
    task.status === Status.OVERDUE ? '!!' : '',
  ].join('')
