import { findNextOccurrenceContract } from '@todopia/tasks-core'
import { RRulePlugin } from '.'

describe('rrule plugin', () => {
  findNextOccurrenceContract(
    () => RRulePlugin().findNextOccurrence,
    () => ({
      cadence: `DTSTART:${formatDateForRRule(new Date('2018-11-05T00:00:00'))}\nRRULE:FREQ=DAILY`,
      baseTime: '2018-11-05T00:00:01',
      nextOccurrence: '2018-11-06T00:00:00',
      firstOccurrence: '2018-11-05T00:00:00'
    })
  )

  // given the local timezone offset is +5 hours,
  // formatDateForRRule(new Date('2018-11-05T00:00:00'))
  // returns '20181105T050000'
  const formatDateForRRule = (date: Date) =>
    date.toISOString().replace(/\..*/,'').replace(/[-:]/g,'')
})
