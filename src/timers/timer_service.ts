import moment from "moment-timezone"
import type { Timer } from "../types"
import { TimerRepository } from "./timer_repository"

export class TimerService {
    private timerRepository: TimerRepository

    constructor(timerRepository: TimerRepository) {
        this.timerRepository = timerRepository
    }

    async createTimer(userId: string, channelId: string, guildId: string, expiration: moment.Moment): Promise<Timer> {
        const timer = <Timer>{
            userId,
            channelId,
            guildId,
            startTime: moment(),
            endTime: expiration,
            isComplete: false
        }

        return this.timerRepository.saveTimer(timer)
    }

    async saveTimer(timer: Timer): Promise<Timer> {
        return this.timerRepository.saveTimer(timer)
    }

    async getActiveTimer(userId: string, guildId: string): Promise<Timer> {
        const timers = await this.timerRepository.getTimers(userId, guildId)
        return timers.find(timer => timer.isComplete === false)
    }

    async getTimers(userId: string, guildId): Promise<Timer[]> {
        return this.timerRepository.getTimers(userId, guildId)
    }

    async getTimersByGuildId(guildId: string): Promise<Timer[]> {
        return this.timerRepository.getTimersByGuildId(guildId)
    }

    deleteTimerById(id: number) {
        this.timerRepository.deleteTimerById(id)
    }
}
