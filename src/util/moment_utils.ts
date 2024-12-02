import moment from 'moment-timezone'

export const formatWithTimezone = (time: moment.Moment, timezone: string = 'America/Denver'): string => {
  return time.tz(timezone, false).format('h:mm A z')
}
