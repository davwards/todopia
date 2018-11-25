import {
  existsSync,
  mkdirSync
} from 'fs'
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
  levelUp,
} from '@todopia/players-core'

import {
  awardPlayerWithCurrency,
  damagePlayer,
} from '@todopia/tasks-player-currency-plugin'

import { updateWorld } from '../update-world'

import { Cli } from '..'

/*
 * This file serves as the dependency injection container
 * for the CLI. It wires up all the dependencies and plugs
 * them into each other; it should not contain any meaningful
 * logic, apart from some "humble objects" which mediate between
 * the CLI's logic and the actual command line
 * (see 'consoleInteractions' below).
 *
 * Any logic that doesn't involve filesystem operations,
 * the nodejs readline module, or other such details
 * should go in the Cli function (imported above) instead of here.
 *
 * NOTE that because this file is logic-free and encapsulates
 * hard-to-test components like the readline interface,
 * there are no tests for it besides the type checker!
 * Seriously, put any meaningful logic in the Cli function
 * where it can be tested!
 */

const todopiaHome = createHomeDirectory()
const persistence = FsBackedRepository(todopiaHome)
const session = FsBackedSession(todopiaHome)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

Cli({

  /* Use cases: */
  createPlayer: createPlayer(persistence, persistence),
  createTask: createTask(persistence),
  completeTask: completeTask(
    persistence,
    awardPlayerWithCurrency(persistence),
  ),
  updateWorld: updateWorld({
    checkDeadlines: checkDeadlines(
      persistence,
      damagePlayer(persistence),
    ),
    resurrectPlayer: resurrectPlayer(persistence),
    levelUp: levelUp(persistence),
    playerRepository: persistence 
  }),

  /* Repositories and other persistence: */
  taskRepository: persistence,
  playerRepository: persistence,
  ledger: persistence,

  /* CLI-specific dependencies: */
  session,
  ui: consoleInteractions(),
  now: () => new Date().toISOString(),

})(
  meaningfulArguments()
).then(() => {
  rl.close()
})


function createHomeDirectory() {
  const path = join(process.env.HOME, '.todopia')
  if(!existsSync(path)) mkdirSync(path)
  return path
}

function consoleInteractions() {
  return {
    choice: (prompt: string, choices: string[]) => {
      console.log('')
      console.log(prompt)
      choices.forEach((choice, i) => {
        console.log(`  ${i}: ${choice}`)
      })

      return new Promise((resolve) =>
        rl.question('Enter the number of your choice: ', resolve)
      ).then((answer: string) => answer) // resolves a type complaint :/
    },

    print: console.log
  }
}

function meaningfulArguments() {
  // The first two arguments in process.argv are
  // 'node' and this file's name,
  // which aren't interesting for our purposes.
  return process.argv.slice(2)
}
