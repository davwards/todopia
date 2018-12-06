import { calculateDeadlineFromDuration } from '..'

describe('duration interpreter', () => {
  let start = '2018-11-05T00:00:00'
  let duration = ''

  givenDurationOf('P1Y', itReturns('2019-11-05T00:00:00'))
  givenDurationOf('P2Y', itReturns('2020-11-05T00:00:00'))

  givenDurationOf('P1M', itReturns('2018-12-05T00:00:00'))
  givenDurationOf('P2M', itReturns('2019-01-05T00:00:00'))

  givenDurationOf('P1W', itReturns('2018-11-12T00:00:00'))
  givenDurationOf('P2W', itReturns('2018-11-19T00:00:00'))

  givenDurationOf('P1D', itReturns('2018-11-06T00:00:00'))
  givenDurationOf('P10D', itReturns('2018-11-15T00:00:00'))

  givenDurationOf('PT1H', itReturns('2018-11-05T01:00:00'))
  givenDurationOf('PT12H', itReturns('2018-11-05T12:00:00'))

  givenDurationOf('PT1M', itReturns('2018-11-05T00:01:00'))
  givenDurationOf('PT15M', itReturns('2018-11-05T00:15:00'))

  givenDurationOf('PT1S', itReturns('2018-11-05T00:00:01'))
  givenDurationOf('PT59S', itReturns('2018-11-05T00:00:59'))

  givenDurationOf('P1Y1M1W1DT1H1M1S', itReturns('2019-12-13T01:01:01'))

  function givenDurationOf(_duration: string, test: () => void) {
    describe(`when duration is ${_duration}`, () => {
      beforeEach(() => { duration = _duration })
      test()
    })
  }

  function itReturns(result: string) {
    return () => {
      it(`returns ${result}`, () => {
        expect(
          calculateDeadlineFromDuration(duration, start)
        ).toEqual(result)
      })
    }
  }
})
