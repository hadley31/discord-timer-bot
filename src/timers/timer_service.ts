import type { Timer } from "types"
import { SimpleTimerRepository, TimerRepository } from "./timer_repository"

export class TimerService {
    private timerRepository: TimerRepository

    constructor(timerRepository: TimerRepository = new SimpleTimerRepository()) {
        this.timerRepository = timerRepository
    }

    createTimer(userId: string, channelId: string, guildId: string, expiration: Date): Timer {
        const timer = <Timer>{
            userId,
            channelId,
            guildId,
            startTime: new Date(),
            endTime: expiration,
            isComplete: false
        }

        return this.timerRepository.saveTimer(timer)
    }

    saveTimer(timer: Timer): Timer {
        return this.timerRepository.saveTimer(timer)
    }

    getTimer(userId: string, guildId: string): Timer {
        return this.timerRepository.getTimer(userId, guildId)
    }

    getTimersByGuildId(guildId: string): Timer[] {
        return this.timerRepository.getTimersByGuildId(guildId)
    }
}

export const timerService = new TimerService()
