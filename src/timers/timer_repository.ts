import type { Timer } from "../types.ts";

export interface TimerRepository {
    getTimers(userId: string, guildId: string): Timer[]
    getTimersByGuildId(guildId: string): Timer[]
    saveTimer(timer: Timer): Timer
    deleteTimerById(id: number)
}

export class SimpleTimerRepository implements TimerRepository {
    private timers: Timer[] = []

    getTimers(userId: string, guildId: string): Timer[] {
        return this.timers.filter(timer => timer.userId === userId && timer.guildId === guildId)
    }

    getTimersByGuildId(guildId: string): Timer[] {
        return this.timers.filter(timer => timer.guildId === guildId)
    }

    saveTimer(timer: Timer): Timer {
        if (timer.id == null) {
            timer.id = this.timers.reduce((max, timer) => timer.id > max ? timer.id : max, 0) + 1
            this.timers.push(timer)
        }
        return timer
    }

    deleteTimerById(id: number) {
        this.timers = this.timers.filter(timer => timer.id !== id)
    }
}
