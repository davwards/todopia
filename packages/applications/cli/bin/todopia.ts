import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import * as readline from 'readline'

import { FsBackedRepository } from '@todopia/filesystem-persistence-plugin'
import { FsBackedSession } from '../session/fs-backed-session'

import {
  createTask,
  completeTask,
  checkDeadlines,
} from '@todopia/tasks-core'

import {
  createPlayer,
  resurrectPlayer,
} from '@todopia/players-core'

import {
  awardPlayerWithCurrency,
  damagePlayer,
} from '@todopia/tasks-player-currency-plugin'

import { Cli } from '..'

const todopiaHome = join(process.env.HOME, '.todopia')

if(!existsSync(todopiaHome)) mkdirSync(todopiaHome)

const persistence = FsBackedRepository(todopiaHome)
const session = FsBackedSession(todopiaHome)

const args = process.argv.slice(2)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

Cli({
  session,
  createPlayer: createPlayer(persistence, persistence),
  createTask: createTask(persistence),
  completeTask: completeTask(
    persistence,
    awardPlayerWithCurrency(persistence),
  ),
  checkDeadlines: checkDeadlines(
    persistence,
    damagePlayer(persistence),
  ),
  resurrectPlayer: resurrectPlayer(persistence),
  taskRepository: persistence,
  playerRepository: persistence,
  ledger: persistence,
  ui: {
    choice: (prompt: string, choices: string[]) => {
      console.log('')
      console.log(prompt)
      choices.forEach((choice, i) => {
        console.log(`  ${i}: ${choice}`)
      })

      return new Promise((resolve) =>
        rl.question('Enter the number of your choice: ', resolve)
      )
    },

    print: (text: string) => {
      console.log(text)
    }
  },
  now: () => new Date().toISOString(),
})(args).then(() => { rl.close() })
