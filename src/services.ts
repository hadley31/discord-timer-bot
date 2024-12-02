import { TimerStatsService } from './stats/timer_stats_service'
import { RedisTimerRepository } from './timers/redis_timer_repository'
import { SimpleTimerRepository, type TimerRepository } from './timers/timer_repository'
import { TimerService } from './timers/timer_service'
import { WheelOfNamesClient } from './wheelofnames/wheel_client'

const { REDIS_HOST } = process.env

const getTimerRepository = async (): Promise<TimerRepository> => {
  if (REDIS_HOST) {
    console.log(`Redis host configured. Using redis for timer store: ${REDIS_HOST}`)
    const repository = new RedisTimerRepository(REDIS_HOST)
    await repository.init()
    return repository
  } else {
    console.warn('No redis host configured. Using default implementation.')
    return new SimpleTimerRepository()
  }
}

const timerRepository = await getTimerRepository()

export const timerService = new TimerService(timerRepository)

export const timerStatsService = new TimerStatsService(timerService)

export const wheelOfNamesClient = new WheelOfNamesClient()
