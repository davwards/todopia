import { rrulestr } from 'rrule'

export const RRulePlugin = () => ({
  findNextOccurrence: (cadence: string, baseTime: string) =>
    Promise.resolve(getLocalDateString(
      rrulestr(cadence).after(new Date(baseTime), true)
    ))
})

// _Surely_ there is a better way than this to get the
// YYYY-MM-DDTHH:mm:SS formatted date in local time?
const getLocalDateString = (utcDate: Date) => {
  utcDate.setMinutes(utcDate.getMinutes() - utcDate.getTimezoneOffset())
  return utcDate.toISOString().replace(/\..*/,'')
}
