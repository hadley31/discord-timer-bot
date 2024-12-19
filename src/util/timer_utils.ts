import moment from 'moment-timezone'
import type { Timer } from '../types'
import { createMomentFromHourAndMinute } from './moment_utils'

const onInRegexAutoDetect =
  /(?:getting ou?n(:?\s+in)?|cs2?(?:\s+in)?|joining in|i can (?:join|play|game)(?:\s*in)?|give me|gimmi?e|i(?:'?ll)? need|i'?ll be(?: ou?n(?: in)?)?)\s*,?\s*(?:around|a?bout|another)?\s*(?:maybe)?\s*(?:like)?\s*~?\s*(one|two|three|four|five|ten|\d+)\s*(minutes?|mins?|m|hours?|hrs?|h|sec)?(?!late)/i
const onAtRegexAutoDetect = /(?:getting ou?n|joining|i can join|i can|i can play)\s*(?:at|around|~)\s*(?:maybe|a?bout)?\s*(?:like)?\s*([\d:]+\s*)/i

const onInRegexes = [
  { regex: /hour and a half/i, func: () => 90 },
  { regex: /(one|two|three|four|five|ten|[\d\.]+)\s+and\s+a\s+half\s+hours?/i, func: (n: string) => parseNumeric(n) * 60 + 30 },
  { regex: /half\s+(?:an\s+)?hour/i, func: () => 30 },
  {
    regex: /(one|two|three|four|five|ten|(?<!\w+)[\d\.]+)\s*(minutes?|mins?|m|hours?|hrs?|h|sec)?/,
    func: (n: string, u: string) => parseNumericWithUnit(n, u),
  },
]

const onAtRegex = /at\s*([\d:]+)/i

const regexes = [...onInRegexes.map((x) => x.regex), onAtRegex]
const regexesAutoDetect = [onInRegexAutoDetect, onAtRegexAutoDetect]

type ParseOptions = {
  startTime?: moment.Moment
}

const parseNumeric = (text: string) => {
  switch (text) {
    case 'one':
      return 1
    case 'two':
      return 2
    case 'three':
      return 3
    case 'four':
      return 4
    case 'five':
      return 5
    case 'ten':
      return 10
    default:
      return parseFloat(text)
  }
}

export const parseNumericWithUnit = (text: string, unit: string): number => {
  let value = parseNumeric(text)
  unit ??= 'm'

  if (unit.startsWith('s')) {
    value = 3
  }

  if (unit.startsWith('h')) {
    value *= 60
  }

  return value
}

export const testOnInRegexes = (message: string): number => {
  for (const { regex, func } of onInRegexes) {
    const match = regex.exec(message)

    if (match) {
      return func(match[1], match[2])
    }
  }

  return null
}

export const parseOnInTime = (message: string, options: ParseOptions = {}): moment.Moment => {
  const minutes = testOnInRegexes(message)

  if (!minutes) {
    return
  }

  const timestamp = options.startTime?.clone() || moment()

  return timestamp.add(minutes, 'minute').endOf('minute')
}

export const parseOnAtTime = (message: string): moment.Moment => {
  const match = onAtRegex.exec(message)

  if (!match) {
    return null
  }

  const time = match[1]

  if (time.includes(':')) {
    const [hourOfDay, minuteOfHour] = time.split(':').map((n) => parseInt(n))

    return createMomentFromHourAndMinute(hourOfDay, minuteOfHour).endOf('minute')
  } else if (time.length <= 2) {
    const hourOfDay = parseInt(time)

    return createMomentFromHourAndMinute(hourOfDay, 0).startOf('hour').endOf('minute')
  } else {
    let hourOfDay = parseInt(time.slice(0, -2))
    const minuteOfHour = parseInt(time.slice(-2))

    return createMomentFromHourAndMinute(hourOfDay, minuteOfHour).endOf('minute')
  }
}

export const calculateTimerEndTime = (message: string, options: ParseOptions = {}): moment.Moment => {
  return parseOnInTime(message, options) || parseOnAtTime(message)
}

export const autoDetectJoinEstimateMessage = (message: string): boolean => {
  return regexesAutoDetect.some((regexes) => regexes.test(message))
}

export const detectJoinEstimateMessage = (message: string): boolean => {
  return regexes.some((regex) => regex.test(message))
}

export const getJoinTimePercentage = (timer: Timer): number => {
  if (!timer.joinTime) {
    return 0
  }

  return timer.joinTime.diff(timer.startTime, 'seconds') / timer.endTime.diff(timer.startTime, 'seconds')
}
