import moment from 'moment-timezone'
import { TimerService } from '../timers/timer_service'
import type { Timer } from '../types'
import { getJoinTimePercentage } from '../util/timer_utils'
import { interpolateTimestamp } from '../util/moment_utils'
import { UserStats } from '../commands/user_stats'

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

  public async getTimerStatsByUserId(userId: string, guildId: string): Promise<UserStats> {
    const timers = await this.timerService.getAllTimersByUserId(userId, guildId)

    return this.createUserStats(userId, timers)
  }

  public async getTimerStatsByGuildId(guildId: string): Promise<UserStats[]> {
    const timers = await this.timerService.getTimersByGuildId(guildId)

    const completedTimers = timers.filter((t) => t.isComplete)

    const timersByUserId = this.groupTimersByUserId(completedTimers)

    return timersByUserId
      .entries()
      .map(([userId, userTimers]) => this.createUserStats(userId, userTimers))
      .toArray()
  }

  private createUserStats(userId: string, timers: Timer[]): UserStats {
    const totalTimers = timers.length
    const onTimeTimers = timers.filter((t) => t.joinTime <= t.endTime)
    const onTimePercentage = onTimeTimers.length / totalTimers
    const joinTimeAccuracy = 1 - Math.abs(1 - timers.reduce((acc, t) => acc + getJoinTimePercentage(t), 0) / timers.length)
    const expiredTimers = timers.filter((t) => t.isComplete && !t.joinTime).length

    return {
      userId,
      totalTimers,
      onTimePercentage,
      joinTimeAccuracy,
      expiredTimers,
    }
  }

  private groupTimersByUserId(timers: Timer[]): Map<string, Timer[]> {
    return timers.reduce((acc, timer) => {
      if (!acc.has(timer.userId)) {
        acc.set(timer.userId, [])
      }

      acc.get(timer.userId).push(timer)

      return acc
    }, new Map<string, Timer[]>())
  }
}
