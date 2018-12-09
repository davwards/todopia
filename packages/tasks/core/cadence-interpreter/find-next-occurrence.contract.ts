import { FindNextOccurrence } from '../model'

export function findNextOccurrenceContract(
  getInterpreter: () => FindNextOccurrence,
  exampleCadence: () => {
    cadence: string
    firstOccurrence: string
    baseTime: string
    nextOccurrence: string
  }
) {

  let interpreter: FindNextOccurrence
  let cadence: string
  let baseTime: string
  let nextOccurrence: string
  let firstOccurrence: string

  beforeEach(() => {
    ({
      cadence,
      baseTime,
      nextOccurrence,
      firstOccurrence,
    } = exampleCadence())

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

    it('returns the next occurrence when an occurrence is given as the base time', () =>
      interpreter(cadence, nextOccurrence)
        .then(result => {
          expect(
            new Date(result).getTime()
          ).toBeGreaterThan(new Date(nextOccurrence).getTime())
        })
    )

    it('returns the first occurrence when no base time is given', () =>
      interpreter(cadence)
        .then(result => {
          expect(result).toEqual(firstOccurrence)
        })
    )
  })
}
