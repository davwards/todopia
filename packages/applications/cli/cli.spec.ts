import { Cli } from '.'

import {
  FakeTaskRepository,
  TaskRepository,
  Status
} from '@todopia/tasks-core'

import {
  PlayerRepository,
  FakePlayerRepository,
  Ledger
} from '@todopia/players-core'

describe('Todopia CLI', () => {
  let createPlayer
  let createTask
  let completeTask
  let session
  let updateWorld
  let taskRepository: TaskRepository
  let playerRepository: PlayerRepository
  let ledger: Ledger
  let now
  let ui
  let cli

  beforeEach(() => {
    createPlayer = jest.fn(() => Promise.resolve())
    createTask = jest.fn(() => Promise.resolve())
    completeTask = jest.fn(() => Promise.resolve())
    updateWorld = jest.fn(() => Promise.resolve())

    taskRepository = FakeTaskRepository()
    playerRepository = FakePlayerRepository()
    ledger = {
      currentStateFor: jest.fn(),
      addTransaction: jest.fn()
    }

    session = {
      login: jest.fn(),
      currentPlayer: () => Promise.resolve('player-a')
    }

    ui = {
      choice: jest.fn(() => Promise.resolve()),
      print: jest.fn(() => Promise.resolve())
    }

    now = '2018-11-05T12:59:59.001Z'

    cli = Cli({
      session,
      createPlayer,
      createTask,
      completeTask,
      updateWorld,
      taskRepository,
      playerRepository,
      ledger,
      ui,
      now: () => now
    })
  })

  describe('creating a player', () => {
    it('invokes the use case with the given name', () =>
      cli(['player', 'create', 'Talapas'])
        .then(() => {
          expect(createPlayer).toHaveBeenCalledWith('Talapas')
        })
    )
  })

  describe('getting player info', () => {
    beforeEach(() => {
      ledger.currentStateFor = jest.fn(() => Promise.resolve({
        currencies: {
          health: 24,
          coin: 9,
          experience: 80
        }
      }))

      return playerRepository
        .savePlayer({id: 'player-a', name: 'Talapas'})
    })

    it('displays info about the logged in player', () =>
      cli(['player', 'info'])
        .then(() => {
          expect(ui.print).toHaveBeenCalledWith('Player: Talapas')
          expect(ui.print).toHaveBeenCalledWith('  health: 24')
          expect(ui.print).toHaveBeenCalledWith('  coin: 9')
          expect(ui.print).toHaveBeenCalledWith('  experience: 80')
        })
    )

    it('updates the world', () =>
      cli(['player', 'info'])
        .then(() =>
          expect(updateWorld).toHaveBeenCalledWith(now)
        )
    )
  })

  describe('logging in', () => {
    describe('when there is exactly one created player', () => {
      beforeEach(() =>
        playerRepository.savePlayer({id: 'player-a', name: 'Player A'})
      )
      
      it('logs in as that player', () =>
        cli(['login'])
          .then(() =>
            expect(session.login).toHaveBeenCalledWith('player-a')
          )
      )

      it('updates the world', () =>
        cli(['login'])
          .then(() =>
            expect(updateWorld).toHaveBeenCalledWith(now)
          )
      )
    })

    describe('when there are several created players', () => {
      beforeEach(() => {
        ui.choice = (prompt: string, choices: string[]) =>
          Promise.resolve(choices.indexOf('Player B'))

        return playerRepository
          .savePlayer({id: 'player-a', name: 'Player A'})
          .then(() => playerRepository
            .savePlayer({id: 'player-b', name: 'Player B'})
          )
      })

      it('prompts for which player to log in as, then creates the session', () => {
        ui.choice = (prompt: string, choices: string[]) => {
          expect(prompt).toEqual('Which player?')
          expect(choices).toContain('Player A')
          expect(choices).toContain('Player B')

          return Promise.resolve(
            choices.indexOf('Player B')
          )
        }

        return cli(['login'])
          .then(() => {
            expect(session.login).toHaveBeenCalledWith('player-b')
          })
      })

      it('updates the world', () =>
        cli(['login'])
          .then(() =>
            expect(updateWorld).toHaveBeenCalledWith(now)
          )
      )
    })
  })

  describe('creating a task', () => {
    describe('with a deadline', () => {
      it('creates a task with the given fields for the logged in player', () =>
        cli(['task', 'create', 'Survey ley lines'])
          .then(() => {
            expect(createTask).toHaveBeenCalledWith(
              'player-a', 'Survey ley lines'
            )
          })
      )

      it('updates the world', () =>
        cli(['task', 'create', 'Survey ley lines'])
          .then(() =>
            expect(updateWorld).toHaveBeenCalledWith(now)
          )
      )
    })

    describe('without a deadline', () => {
      it('creates a task with the given fields for the logged in player', () =>
        cli(['task', 'create', 'Survey ley lines', '--deadline', '2018-11-05'])
          .then(() => {
            expect(createTask).toHaveBeenCalledWith(
              'player-a', 'Survey ley lines', '2018-11-05'
            )
          })
      )

      it('updates the world', () =>
        cli(['task', 'create', 'Survey ley lines', '--deadline', '2018-11-05'])
          .then(() =>
            expect(updateWorld).toHaveBeenCalledWith(now)
          )
      )
    })
  })

  describe('listing tasks', () => {
    beforeEach(() =>
      taskRepository
        .saveTask({
          id: 'task-1',
          playerId: 'player-a',
          title: 'Completed Task',
          status: Status.COMPLETE,
          createdAt: '2018-11-01T00:00:00',
        })
        .then(() => taskRepository.saveTask({
          id: 'task-2',
          playerId: 'player-a',
          title: 'First Incomplete Task',
          status: Status.INCOMPLETE,
          createdAt: '2018-11-01T00:00:00',
        }))
        .then(() => taskRepository.saveTask({
          id: 'task-3',
          playerId: 'player-a',
          title: 'Second Incomplete Task',
          deadline: '2018-11-05',
          status: Status.INCOMPLETE,
          createdAt: '2018-11-01T00:00:00',
        }))
        .then(() => taskRepository.saveTask({
          id: 'task-4',
          playerId: 'player-a',
          title: 'Overdue Task',
          deadline: '2018-11-01',
          status: Status.OVERDUE,
          createdAt: '2018-11-01T00:00:00',
        }))
        .then(() => taskRepository.saveTask({
          id: 'task-5',
          playerId: 'player-b',
          title: 'Incomplete task for different player',
          status: Status.INCOMPLETE,
          createdAt: '2018-11-01T00:00:00',
        }))
    )

    it('prints not-completed tasks for the logged in player', () =>
      cli(['task', 'list'])
        .then(() => {
          expect(ui.print).toHaveBeenCalledWith('First Incomplete Task')
          expect(ui.print).toHaveBeenCalledWith('Second Incomplete Task (due 2018-11-05)')
          expect(ui.print).toHaveBeenCalledWith('Overdue Task (due 2018-11-01)!!')
          expect(ui.print).not.toHaveBeenCalledWith('Completed Task')
          expect(ui.print).not.toHaveBeenCalledWith('Incomplete task for a different player')
        })
    )

    it('updates the world', () =>
      cli(['task', 'list'])
        .then(() =>
          expect(updateWorld).toHaveBeenCalledWith(now)
        )
    )
  })

  describe('completing a task', () => {
    beforeEach(() =>
      taskRepository
        .saveTask({
          id: 'task-1',
          playerId: 'player-a',
          title: 'Completed Task',
          status: Status.COMPLETE,
          createdAt: '2018-11-01T00:00:00',
        })
        .then(() => taskRepository.saveTask({
          id: 'task-2',
          playerId: 'player-a',
          title: 'First Incomplete Task',
          status: Status.INCOMPLETE,
          createdAt: '2018-11-01T00:00:00',
        }))
        .then(() => taskRepository.saveTask({
          id: 'task-3',
          playerId: 'player-a',
          title: 'Second Incomplete Task',
          deadline: '2018-11-05',
          status: Status.INCOMPLETE,
          createdAt: '2018-11-01T00:00:00',
        }))
        .then(() => taskRepository.saveTask({
          id: 'task-4',
          playerId: 'player-a',
          title: 'Overdue Task',
          deadline: '2018-11-01',
          status: Status.OVERDUE,
          createdAt: '2018-11-01T00:00:00',
        }))
        .then(() => taskRepository.saveTask({
          id: 'task-5',
          playerId: 'player-b',
          title: 'Incomplete task for different player',
          status: Status.INCOMPLETE,
          createdAt: '2018-11-01T00:00:00',
        }))
    )

    beforeEach(() => {
      ui.choice = (prompt: string, choices: string[]) =>
        Promise.resolve(choices.indexOf('First Incomplete Task'))
    })

    it('prompts for which not-completed task to complete, then invokes the use case with the id of that task', () => {
      ui.choice = (prompt: string, choices: string[]) => {
        expect(prompt).toEqual('Which task?')
        expect(choices).toContain('First Incomplete Task')
        expect(choices).toContain('Second Incomplete Task (due 2018-11-05)')
        expect(choices).toContain('Overdue Task (due 2018-11-01)!!')
        expect(choices).not.toContain('Completed Task')
        expect(choices).not.toContain('Incomplete task for a different player')

        return Promise.resolve(
          choices.indexOf('First Incomplete Task')
        )
      }

      return cli(['task', 'complete'])
        .then(() => {
          expect(completeTask).toHaveBeenCalledWith('task-2')
        })
    })

    it('updates the world', () =>
      cli(['task', 'complete'])
        .then(() =>
          expect(updateWorld).toHaveBeenCalledWith(now)
        )
    )
  })
})

