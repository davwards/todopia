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

  completeTask: (taskId: string) => Promise<void>,

  taskRepository: TaskRepository,

  playerRepository: PlayerRepository,

  ui: {
    choice: (prompt: string, choices: string[]) => Promise<string>
  }

}) => (

  argv: string[],

) => {

  if(argv[0] === 'login') {
    inj.session.login(argv[1])
    return Promise.resolve()
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


}
