import moment from 'moment-timezone'
import { TimerService } from '../timers/timer_service'
import type { Timer } from '../types'
import { getJoinTimePercentage } from '../util/timer_utils'
import { interpolateTimestamp } from '../util/moment_utils'

export class TimerStatsService {
  private timerService: TimerService

  constructor(timerService: TimerService) {
    this.timerService = timerService
  }

  public async getExpectedJoinTime(timer: Timer): Promise<moment.Moment> {
    if (timer.isComplete) {
      return timer.joinTime
    }

    const { userId, guildId } = timer
    const historicTimers = await this.timerService.getCompleteTimersByUserId(userId, guildId)

    if (historicTimers.length === 0) {
      return timer.endTime.clone()
    }

    const expectedPercentage = historicTimers.reduce((acc, t) => acc + getJoinTimePercentage(t), 0) / historicTimers.length

    return interpolateTimestamp(timer.startTime, timer.endTime, expectedPercentage)
  }

  public async getUserOnTimePercentage(userId: string, guildId: string) {
    const timers = await this.timerService.getAllTimersByUserId(userId, guildId)
    return timers.filter((t) => t.joinTime <= t.endTime).length / timers.length
  }
}
