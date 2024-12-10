import moment from 'moment-timezone'

export const formatWithTimezone = (time: moment.Moment, timezone: string = 'America/Denver'): string => {
  return time.tz(timezone, false).format('h:mm A z')
}

export const interpolateTimestamp = (start: moment.Moment, end: moment.Moment, t: number): moment.Moment => {
  return start.clone().add(end.diff(start, 'minutes') * t, 'minutes')
}
