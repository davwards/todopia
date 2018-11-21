import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

import { FsBackedRepository } from '@todopia/filesystem-persistence-plugin'

const todoHome = join(process.env.HOME, '.todopia')

if(!existsSync(todoHome)) mkdirSync(todoHome)

const persistence = FsBackedRepository(todoHome)

const args = process.argv.slice(2)

console.log(args)

