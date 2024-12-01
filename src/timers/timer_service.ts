import moment from 'moment-timezone'
import type { CreateTimerRequest, Timer } from '../types'
import { TimerRepository } from './timer_repository'
import { TimerCreationError } from '../errors'

export class TimerService {
  private timerRepository: TimerRepository

  constructor(timerRepository: TimerRepository) {
    this.timerRepository = timerRepository
  }

  async createTimer(timer: CreateTimerRequest): Promise<Timer> {
    const existingTimerOnMessage = await this.timerRepository.getTimerByMessageId(timer.messageId)
    if (existingTimerOnMessage) {
      throw new TimerCreationError('A timer already exists for message: ' + timer.messageId)
    }

    const existingActiveTimer = await this.getActiveTimerByUserId(timer.userId, timer.guildId)
    if (existingActiveTimer) {
      throw new TimerCreationError('A timer is already active for user: ' + timer.userId + ' in guild: ' + timer.guildId)
    }

    const now = moment()

    if (timer.endTime.isBefore(now)) {
      throw new TimerCreationError('Expiration time is in the past')
    }

    const newTimer = <Timer>{
      ...timer,
      joinTime: null,
      isComplete: false,
    }

    return this.timerRepository.saveTimer(newTimer)
  }

  async saveTimer(timer: Timer): Promise<Timer> {
    return this.timerRepository.saveTimer(timer)
  }

  async getActiveTimerByUserId(userId: string, guildId: string): Promise<Timer> {
    const timers = await this.timerRepository.getTimers(userId, guildId)
    return timers.find((timer) => timer.isComplete === false)
  }

  async getAllTimersByUserId(userId: string, guildId): Promise<Timer[]> {
    return this.timerRepository.getTimers(userId, guildId)
  }

  async getCompleteTimersByUserId(userId: string, guildId: string): Promise<Timer[]> {
    const timers = await this.getAllTimersByUserId(userId, guildId)
    return timers.filter((t) => t.isComplete === true && t.joinTime)
  }

  async getTimersByGuildId(guildId: string): Promise<Timer[]> {
    return this.timerRepository.getTimersByGuildId(guildId)
  }

  deleteTimerById(id: string) {
    this.timerRepository.deleteTimerById(id)
  }
}
