import { Timer } from "types";

export interface TimerRepository {
    saveTimer(timer: Timer): Timer
    getTimer(userId: string, channelId: string): Timer
    getTimersByGuildId(guildId: string): Timer[]
}

export class SimpleTimerRepository implements TimerRepository {
    private timers: Timer[] = []

    saveTimer(timer: Timer): Timer {
        if (timer.id == null) {
            timer.id = this.timers.reduce((max, timer) => timer.id > max ? timer.id : max, 0) + 1
            this.timers.push(timer)
        }
        return timer
    }

    getTimer(userId: string, guildId: string): Timer {
        return this.timers.find(timer => timer.userId === userId && timer.guildId === guildId)
    }

    getTimersByGuildId(guildId: string): Timer[] {
        return this.timers.filter(timer => timer.guildId === guildId)
    }
}
