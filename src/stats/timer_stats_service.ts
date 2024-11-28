import moment from "moment-timezone"
import { TimerService } from "../timers/timer_service"
import type { Timer } from "../types"
import { getJoinTimePercentage } from "../timers/timer_utils"

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

        return TimerStatsService.interpolateTimestamp(timer.startTime, timer.endTime, expectedPercentage)
    }

    private static interpolateTimestamp(start: moment.Moment, end: moment.Moment, t: number): moment.Moment {
        return start.clone().add(end.diff(start, 'minutes') * t, 'minutes')
    }
}
