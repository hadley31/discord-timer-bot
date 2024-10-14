import type { Timer } from "../types"

export interface TimerRepository {
    getTimers(userId: string, guildId: string): Promise<Timer[]>
    getTimersByGuildId(guildId: string): Promise<Timer[]>
    saveTimer(timer: Timer): Promise<Timer>
    deleteTimerById(id: number): Promise<void>
}

export class SimpleTimerRepository implements TimerRepository {
    private timers: Timer[] = []

    async getTimers(userId: string, guildId: string): Promise<Timer[]> {
        return Promise.resolve(this.timers.filter(timer => timer.userId === userId && timer.guildId === guildId))
    }

    async getTimersByGuildId(guildId: string): Promise<Timer[]> {
        return Promise.resolve(this.timers.filter(timer => timer.guildId === guildId))
    }

    async saveTimer(timer: Timer): Promise<Timer> {
        if (timer.id == null) {
            timer.id = this.timers.reduce((max, timer) => timer.id > max ? timer.id : max, 0) + 1
            this.timers.push(timer)
        }
        return Promise.resolve(timer)
    }

    async deleteTimerById(id: number): Promise<void> {
        this.timers = this.timers.filter(timer => timer.id !== id)
    }
}
