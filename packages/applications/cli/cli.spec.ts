import { Cli } from '.'

import {
  FakeTaskRepository,
  TaskRepository,
  Status
} from '@todopia/tasks-core'

import {
  PlayerRepository,
  FakePlayerRepository,
} from '@todopia/players-core'

describe('Todopia CLI', () => {
  let createPlayer
  let createTask
  let completeTask
  let session
  let taskRepository: TaskRepository
  let playerRepository: PlayerRepository
  let ui
  let cli

  beforeEach(() => {
    createPlayer = jest.fn()
    createTask = jest.fn()
    completeTask = jest.fn()
    taskRepository = FakeTaskRepository()
    playerRepository = FakePlayerRepository()

    session = {
      login: jest.fn(),
      currentPlayer: () => Promise.resolve('player-a')
    }

    ui = {
      choice: jest.fn(),
    }

    cli = Cli({
      session,
      createPlayer,
      createTask,
      completeTask,
      taskRepository,
      playerRepository,
      ui,
    })
  })

  describe('creating a player', () => {
    it('invokes the use case with the given name', () => {
      cli(['player', 'create', 'Talapas'])
      expect(createPlayer).toHaveBeenCalledWith('Talapas')
    })
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
    })

    describe('when there are several created players', () => {
      beforeEach(() =>
        playerRepository
          .savePlayer({id: 'player-a', name: 'Player A'})
          .then(() => playerRepository
            .savePlayer({id: 'player-b', name: 'Player B'})
          )
      )

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
    })
  })

  describe('completing a task', () => {
    beforeEach(() =>
      taskRepository
        .saveTask({
          id: 'task-1',
          playerId: 'player-a',
          title: 'Completed Task',
          status: Status.COMPLETE
        })
        .then(() => taskRepository.saveTask({
          id: 'task-2',
          playerId: 'player-a',
          title: 'First Incomplete Task',
          status: Status.INCOMPLETE
        }))
        .then(() => taskRepository.saveTask({
          id: 'task-3',
          playerId: 'player-a',
          title: 'Second Incomplete Task',
          deadline: '2018-11-05',
          status: Status.INCOMPLETE
        }))
        .then(() => taskRepository.saveTask({
          id: 'task-4',
          playerId: 'player-a',
          title: 'Overdue Task',
          deadline: '2018-11-01',
          status: Status.OVERDUE
        }))
        .then(() => taskRepository.saveTask({
          id: 'task-5',
          playerId: 'player-b',
          title: 'Incomplete task for different player',
          status: Status.INCOMPLETE
        }))
    )

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
  })
})

