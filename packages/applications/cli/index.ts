import {
  TaskRepository,
  RecurringTaskRepository,
  Status,
  Task,
  RecurringTask,
} from '@todopia/tasks-core'
import { PlayerRepository, Ledger } from '@todopia/players-core'
import { Session } from './model'

export const Cli = (inj: {

  session: Session,

  createPlayer: (name: string) => Promise<any>,

  createTask: (
    playerId: string,
    title: string,
    deadline?: string
  ) => Promise<any>,

  completeTask: (taskId: string) => Promise<any>,

  updateWorld: (currentTime: string) => Promise<any>,

  taskRepository: TaskRepository,

  recurringTaskRepository: RecurringTaskRepository,

  playerRepository: PlayerRepository,

  ledger: Ledger,

  ui: {
    choice: (prompt: string, choices: string[]) => Promise<string>
    print: (text: string) => void
  },

  now: () => string

}) => (

  argv: string[],

): Promise<any> => (

  inj.updateWorld(inj.now()).then(() => {

    if(argv[0] === 'login') {
      return inj.playerRepository.findAllPlayers()
        .then(players => players.length === 1
          ? players[0]
          : inj.ui.choice(
              'Which player?',
              players.map(player => player.name)
            )
            .then(choiceIndex => players[choiceIndex])
        ).then(player => inj.session.login(player.id))
    }

    if(argv[0] === 'player') {
      if(argv[1] === 'create') {
        return inj.createPlayer(argv[2])
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
        if(argv[3] === '--daily') {
          return inj.session.currentPlayer()
            .then(playerId =>
              inj.recurringTaskRepository.saveRecurringTask({
                playerId,
                title: argv[2],
                cadence: `DTSTART:${formatDateForRRule(new Date(inj.now()))}\nRRULE:FREQ=DAILY`,
                duration: 'P1D'
              })
            )
        }

        return inj.session.currentPlayer()
          .then(playerId => argv[3] === '--deadline'
            ? inj.createTask(playerId, argv[2], argv[4])
            : inj.createTask(playerId, argv[2])
          )
      }

      if(argv[1] === 'list') {
        return inj.session.currentPlayer()
          .then(playerId => Promise.all([
              inj.taskRepository
                .findAllCompletableTasksForPlayer(playerId),
              inj.recurringTaskRepository
                .findRecurringTasksForPlayer(playerId)
          ]))
          .then(([tasks, recurringTasks]) => {
            inj.ui.print('')
            inj.ui.print('=== One-time tasks: ====')
            tasks
              .map(displayTask)
              .forEach(task => inj.ui.print(task))
            inj.ui.print('')
            inj.ui.print('=== Recurring tasks: ===')
            recurringTasks
              .map(displayRecurringTask)
              .forEach(task => inj.ui.print(task))
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
  })

)

const displayTask = (task: Task) =>
  [
    task.title,
    task.deadline ? ` (due ${task.deadline})` : '',
    task.status === Status.OVERDUE ? '!!' : '',
  ].join('')

const displayRecurringTask = (task: RecurringTask) =>
  task.cadence.endsWith('FREQ=DAILY')
    ? `${task.title} (daily)`
    : task.title

const formatDateForRRule = (date: Date) =>
  date.toISOString().replace(/\..*/,'').replace(/[-:]/g,'')
