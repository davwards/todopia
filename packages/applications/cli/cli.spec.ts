import { Cli } from '.'
import {
  FakeTaskRepository,
  TaskRepository,
  Status
} from '@todopia/tasks-core'

describe('Todopia CLI', () => {
  let createPlayer
  let createTask
  let completeTask
  let session
  let taskRepository: TaskRepository
  let ui
  let cli

  beforeEach(() => {
    createPlayer = jest.fn()
    createTask = jest.fn()
    completeTask = jest.fn()
    session = {
      login: jest.fn(),
      currentPlayer: () => Promise.resolve('player-a')
    }
    taskRepository = FakeTaskRepository()
    ui = {
      choice: jest.fn(),
    }

    cli = Cli({
      createPlayer,
      createTask,
      completeTask,
      session,
      taskRepository,
      ui
    })
  })

  describe('creating a player', () => {
    it('invokes the use case with the given name', () => {

      cli(['player', 'create', 'Talapas'])

      expect(createPlayer).toHaveBeenCalledWith('Talapas')
    })
  })

  describe('logging in', () => {
    it('delegates to the session', () => {
      cli(['login', 'Talapas'])

      expect(session.login).toHaveBeenCalledWith('Talapas')
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

