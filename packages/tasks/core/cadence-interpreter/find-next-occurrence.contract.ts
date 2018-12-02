import { FindNextOccurrence } from '../model'

export function findNextOccurrenceContract(
  getInterpreter: () => FindNextOccurrence,
  givenACadenceAndItsNextOccurrenceAfterABaseTime: () => {
    cadence: string
    baseTime: string
    nextOccurrence: string
  }
) {

  let interpreter: FindNextOccurrence
  let cadence: string
  let baseTime: string
  let nextOccurrence: string

  beforeEach(() => {
    ({ cadence, baseTime, nextOccurrence } =
      givenACadenceAndItsNextOccurrenceAfterABaseTime())
    interpreter = getInterpreter()
  })

  describe('finding next occurrences of a cadence', () => {
    it('returns the next occurrence of the cadence after the given time', () =>
      interpreter(cadence, baseTime)
        .then(result => {
          expect(result).toEqual(nextOccurrence)
          expect(
            new Date(result).getTime()
          ).toBeGreaterThan(new Date(baseTime).getTime())
        })
    )

    it('returns the base time when the next occurrence is exactly on the base time', () =>
      interpreter(cadence, nextOccurrence)
        .then(result => {
          expect(result).toEqual(nextOccurrence)
        })
    )
  })
}
