import { TimerStatsService } from "./stats/timer_stats_service"
import { RedisTimerRepository } from "./timers/redis_timer_repository"
import { SimpleTimerRepository } from "./timers/timer_repository"
import { TimerService } from "./timers/timer_service"

const { REDIS_HOST } = process.env

async function getTimerRepository() {
    if (REDIS_HOST) {
        const repository = new RedisTimerRepository(REDIS_HOST)
        await repository.init()
        return repository
    } else {
        return new SimpleTimerRepository()
    }
}

const timerRepository = await getTimerRepository()

export const timerService = new TimerService(timerRepository)

export const timerStatsService = new TimerStatsService(timerService);
