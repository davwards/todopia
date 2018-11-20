import { playerRepositoryContract } from '..'
import { FakePlayerRepository } from './fake-player-repository'

describe('FakePlayerRepository', () => {
  playerRepositoryContract(FakePlayerRepository)
})
