
/* Duration is interpreted according to ISO 8601
 * (see https://en.wikipedia.org/wiki/ISO_8601#Durations)
 * except that fractional values like P0.5D are not supported. */

export const calculateDeadlineFromDuration = (
  duration: string,
  start: string
) => getLocalDateString(
  tokenize(duration).reduce(adjustDateForToken, new Date(start))
)


interface DurationToken {
  unit: string
  value: number
}

const adjustDateForToken = (date: Date, token: DurationToken) => {
  const field =  {
    Y: 'FullYear',
    M: 'Month',
    W: 'Date', // there is no getWeek or setWeek method
    D: 'Date',
    H: 'Hours',
    m: 'Minutes',
    S: 'Seconds',
  }[token.unit]
  
  if(!field) throw new Error(`Unsupported duration unit: ${token.unit}`)

  const multiplier = token.unit === 'W' ? 7 : 1

  const currentValue = date[`get${field}`]()
  const newValue = currentValue + token.value * multiplier

  date[`set${field}`](newValue)

  return date
}

const tokenize = (duration: string) =>
  durationWithoutLeadingP(duration)
    .split('')
    .reduce(
      (
        acc: {
          tokens: DurationToken[]
          nextValue: string
          inTimeSegment: boolean // for disambiguating Months and Minutes
        },
        char: string
      ) => {

        if(char === 'T')
          return { ...acc, inTimeSegment: true }

        if(/[0-9]/.test(char))
          return { ...acc, nextValue: acc.nextValue + char }

        if(/[YMWDHS]/.test(char)) {
          const unit = (char === 'M' && acc.inTimeSegment)
            ? 'm'
            : char

          const value = parseInt(acc.nextValue)

          acc.tokens.push({ unit, value })
          acc.nextValue = ''
          return acc
        }

        throw new Error(`Malformed duration string: ${duration}`)

      }, {tokens: [], nextValue: '', inTimeSegment: false}
    )
    .tokens

const durationWithoutLeadingP = (duration: string) =>
  duration.slice(1)

const getLocalDateString = (utcDate: Date) => {
  utcDate.setMinutes(utcDate.getMinutes() - utcDate.getTimezoneOffset())
  return utcDate.toISOString().replace(/\..*/,'')
}
