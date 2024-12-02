import { expect, test, mock } from 'bun:test'
import { TimerStatsService } from './timer_stats_service'
import moment from 'moment-timezone'
import { TimerService } from '../timers/timer_service'
import type { Timer } from '../types'

const baseStartTime = moment.unix(1731800000)

mock.module('../timers/timer_service', () => ({
  TimerService: mock().mockImplementation(() => ({
    getCompleteTimersByUserId: mock().mockResolvedValue([
      {
        startTime: baseStartTime.clone(),
        endTime: baseStartTime.clone().add(5, 'minutes'),
        joinTime: baseStartTime.clone().add(3, 'minutes'),
      },
      {
        startTime: baseStartTime.clone(),
        endTime: baseStartTime.clone().add(10, 'minutes'),
        joinTime: baseStartTime.clone().add(8, 'minutes'),
      },
    ]),
  })),
}))

test('getCompleteTimersByUserId', async () => {
  const service = new TimerStatsService(new TimerService(null))

  const timer: Timer = {
    id: '1',
    userId: '1234',
    guildId: '5678',
    channelId: '1111',
    messageId: '2222',
    startTime: baseStartTime,
    endTime: baseStartTime.clone().add(10, 'minutes'),
    isComplete: false,
  }

  const result = await service.getExpectedJoinTime(timer)

  expect(result).toEqual(baseStartTime.clone().add(7, 'minutes'))
})
