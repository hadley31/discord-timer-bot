import moment = require("moment-timezone")
import type { Timer } from "../types.ts"
import { SimpleTimerRepository, TimerRepository } from "./timer_repository"

export class TimerService {
    private timerRepository: TimerRepository

    constructor(timerRepository: TimerRepository = new SimpleTimerRepository()) {
        this.timerRepository = timerRepository
    }

    createTimer(userId: string, channelId: string, guildId: string, expiration: moment.Moment): Timer {
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

    saveTimer(timer: Timer): Timer {
        return this.timerRepository.saveTimer(timer)
    }

    getActiveTimer(userId: string, guildId: string): Timer {
        return this.timerRepository.getTimers(userId, guildId).find(timer => !timer.isComplete)
    }

    getTimers(userId: string, guildId): Timer[] {
        return this.timerRepository.getTimers(userId, guildId)
    }

    getTimersByGuildId(guildId: string): Timer[] {
        return this.timerRepository.getTimersByGuildId(guildId)
    }

    deleteTimerById(id: number) {
        this.timerRepository.deleteTimerById(id)
    }
}

export const timerService = new TimerService()
