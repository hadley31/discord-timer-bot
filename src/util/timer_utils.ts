import moment from 'moment-timezone'
import type { Timer } from '../types'

const onInRegexAutoDetect =
  /(?:getting ou?n(:?\s+in)?|cs2?(?:\s+in)?|joining in|i can (?:join|play|game)(?:\s*in)?|give me|gimmi?e|i(?:'?ll)? need|i'?ll be(?: ou?n(?: in)?)?)\s*,?\s*(?:around|a?bout|another)?\s*(?:maybe)?\s*(?:like)?\s*~?\s*(one|two|three|four|five|ten|\d+)\s*(minutes?|mins?|m|hours?|hrs?|h|sec)?(?!late)/i
const onAtRegexAutoDetect = /(?:getting ou?n|joining|i can join|i can|i can play)\s*(?:at|around|~)\s*(?:maybe|a?bout)?\s*(?:like)?\s*([\d:]+\s*)/i

const onInRegex = /(one|two|three|four|five|ten|\d+)\s*(minutes?|mins?|m|hours?|hrs?|h|sec)?/i
const onAtRegex = /at\s*([\d:]+)/i

const regexes = [onInRegex, onAtRegex]
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
      return parseInt(text)
  }
}

export const parseOnInTime = (message: string, options: ParseOptions = {}): moment.Moment => {
  const match = onInRegex.exec(message)

  if (!match) {
    return
  }

  let value = parseNumeric(match[1])
  const unit = match[2] || 'm'

  if (unit.startsWith('s')) {
    value = 3
  }
  if (unit.startsWith('h')) {
    value *= 60
  }

  const timestamp = options.startTime || moment()

  return timestamp.add(value, 'minute').startOf('minute')
}

const createDate = (hour: number, minute: number): moment.Moment => {
  const date = moment()

  const currentHour = date.hour()

  date.hour(hour).minute(minute)

  if (currentHour > hour) {
    date.add(12, 'hour')
  }

  return date
}

export const parseOnAtTime = (message: string): moment.Moment => {
  const match = onAtRegex.exec(message)

  if (!match) {
    return null
  }

  const time = match[1]

  if (time.includes(':')) {
    const [hourOfDay, minuteOfHour] = time.split(':').map((n) => parseInt(n))

    return createDate(hourOfDay, minuteOfHour).startOf('minute')
  } else if (time.length <= 2) {
    const hourOfDay = parseInt(time)

    return createDate(hourOfDay, 0).startOf('hour')
  } else {
    let hourOfDay = parseInt(time.slice(0, -2))
    const minuteOfHour = parseInt(time.slice(-2))

    return createDate(hourOfDay, minuteOfHour).startOf('minute')
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
  return timer.joinTime.diff(timer.startTime, 'minutes') / timer.endTime.diff(timer.startTime, 'minutes')
}
