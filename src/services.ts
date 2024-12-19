import { TimerStatsService } from './stats/timer_stats_service'
import { RedisTimerRepository } from './timers/redis_timer_repository'
import { SimpleTimerRepository, type TimerRepository } from './timers/timer_repository'
import { TimerService } from './timers/timer_service'
import logger from './util/logger'
import { WheelOfNamesClient } from './wheelofnames/wheel_client'
import { client } from './discord'
import { CancelExpiredTimersCron } from './scheduled/cancel_expired_timers'

const { REDIS_HOST } = process.env

const getTimerRepository = async (): Promise<TimerRepository> => {
  if (REDIS_HOST) {
    logger.info(`Redis host configured. Using redis for timer store with host: ${REDIS_HOST}:6379`)
    const repository = new RedisTimerRepository(REDIS_HOST)
    await repository.init()
    return repository
  } else {
    logger.warn('No redis host configured. Using default implementation.')
    return new SimpleTimerRepository()
  }
}

const timerRepository = await getTimerRepository()

export const timerService = new TimerService(timerRepository)

export const cancelExpiredTimersCron = new CancelExpiredTimersCron(timerRepository, client)

export const timerStatsService = new TimerStatsService(timerService)

export const wheelOfNamesClient = new WheelOfNamesClient()
