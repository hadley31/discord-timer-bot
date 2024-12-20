import moment from 'moment-timezone'
import { createClient, RedisClientType } from 'redis'
import { Repository, Schema, EntityId } from 'redis-om'
import type { Timer } from '../types'
import type { TimerRepository } from './timer_repository'

type RedisTimerEntity = {
  userId: string
  channelId: string
  guildId: string
  messageId: string
  startTime: Date
  endTime: Date
  joinTime?: Date
  isComplete: boolean
}

const timerSchema = new Schema<RedisTimerEntity>('timer', {
  userId: { type: 'string' },
  channelId: { type: 'string' },
  guildId: { type: 'string' },
  messageId: { type: 'string' },
  startTime: { type: 'date' },
  endTime: { type: 'date' },
  joinTime: { type: 'date' },
  isComplete: { type: 'boolean' },
})

const USER_ID = 'userId'
const GUILD_ID = 'guildId'
const MESSAGE_ID = 'messageId'
const END_TIME = 'endTime'
const IS_COMPLETE = 'isComplete'

export class RedisTimerRepository implements TimerRepository {
  private readonly redis: RedisClientType
  private readonly timerRedisRepository: Repository<RedisTimerEntity>

  constructor(host: string, port = 6379) {
    this.redis = createClient({ url: `redis://${host}:${port}` })
    this.timerRedisRepository = new Repository(timerSchema, this.redis)
  }

  async init(): Promise<void> {
    await this.redis.connect()
    return this.timerRedisRepository.createIndex()
  }

  async getTimers(userId: string, guildId: string): Promise<Timer[]> {
    const timerEntities = await this.timerRedisRepository.search().where(USER_ID).eq(userId).and(GUILD_ID).eq(guildId).return.all()
    return timerEntities.map(this.entityToTimer)
  }

  async getTimersByGuildId(guildId: string): Promise<Timer[]> {
    const timerEntities = await this.timerRedisRepository.search().where(GUILD_ID).eq(guildId).return.all()
    return timerEntities.map(this.entityToTimer)
  }

  async getTimerByMessageId(messageId: string): Promise<Timer> {
    const timerEntity = await this.timerRedisRepository.search().where(MESSAGE_ID).eq(messageId).return.first()
    return this.entityToTimer(timerEntity)
  }

  async saveTimer(timer: Timer): Promise<Timer> {
    const timerEntity = this.timerToEntity(timer)

    timerEntity[EntityId] = timer.id

    const entity = await this.timerRedisRepository.save(timerEntity)

    return this.entityToTimer(entity)
  }

  async deleteTimerById(id: string): Promise<void> {
    await this.timerRedisRepository.remove(id)
  }

  async getIncompleteTimersOlderThan(timestamp: moment.Moment): Promise<Timer[]> {
    const timerEntities = await this.timerRedisRepository.search().where(END_TIME).lt(timestamp.toDate()).and(IS_COMPLETE).eq(false).return.all()
    return timerEntities.map(this.entityToTimer)
  }

  private entityToTimer(entity: RedisTimerEntity): Timer {
    if (!entity) {
      return null
    }

    return <Timer>{
      id: entity[EntityId],
      userId: entity.userId,
      channelId: entity.channelId,
      guildId: entity.guildId,
      messageId: entity.messageId,
      startTime: moment(entity.startTime),
      endTime: moment(entity.endTime),
      joinTime: entity.joinTime ? moment(entity.joinTime) : null,
      isComplete: entity.isComplete === true,
    }
  }

  private timerToEntity(timer: Timer): RedisTimerEntity {
    if (!timer) {
      return null
    }

    return <RedisTimerEntity>{
      userId: timer.userId,
      channelId: timer.channelId,
      guildId: timer.guildId,
      messageId: timer.messageId,
      startTime: timer.startTime.toDate(),
      endTime: timer.endTime.toDate(),
      joinTime: timer.joinTime?.toDate(),
      isComplete: timer.isComplete,
    }
  }
}
