import moment from 'moment-timezone'
import type { Timer } from '../types'

export interface TimerRepository {
  getTimers(userId: string, guildId: string): Promise<Timer[]>
  getTimersByGuildId(guildId: string): Promise<Timer[]>
  getTimerByMessageId(messageId: string): Promise<Timer>
  saveTimer(timer: Timer): Promise<Timer>
  deleteTimerById(id: string): Promise<void>
  getIncompleteTimersOlderThan(timestamp: moment.Moment): Promise<Timer[]>
}

export class SimpleTimerRepository implements TimerRepository {
  private timers: Timer[] = []
  private nextId = 1

  async getTimers(userId: string, guildId: string): Promise<Timer[]> {
    return Promise.resolve(this.timers.filter((timer) => timer.userId === userId && timer.guildId === guildId))
  }

  async getTimersByGuildId(guildId: string): Promise<Timer[]> {
    return Promise.resolve(this.timers.filter((timer) => timer.guildId === guildId))
  }

  async getTimerByMessageId(messageId: string): Promise<Timer> {
    return Promise.resolve(this.timers.find((timer) => timer.messageId === messageId))
  }

  async saveTimer(timer: Timer): Promise<Timer> {
    if (!timer.id) {
      timer.id = String(this.nextId++)
      this.timers.push(timer)
    }
    return Promise.resolve(timer)
  }

  async deleteTimerById(id: string): Promise<void> {
    this.timers = this.timers.filter((timer) => timer.id !== id)
  }

  async getIncompleteTimersOlderThan(timestamp: moment.Moment): Promise<Timer[]> {
    return this.timers.filter((timer) => !timer.isComplete && timer.endTime.isBefore(timestamp))
  }
}
