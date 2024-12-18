import moment from 'moment-timezone'

export const formatWithTimezone = (time: moment.Moment, timezone: string = 'America/Denver'): string => {
  return time.tz(timezone, false).format('h:mm A z')
}

export const interpolateTimestamp = (start: moment.Moment, end: moment.Moment, t: number): moment.Moment => {
  return start.clone().add(end.diff(start, 'minutes') * t, 'minutes')
}

export const createMomentFromHourAndMinute = (hour: number, minute: number): moment.Moment => {
  const date = moment().tz('America/Denver')
  const now = moment().tz('America/Denver')

  date.hour(hour).minute(minute)

  while (date.isBefore(now)) {
    date.add(12, 'hours')
  }

  return date
}
