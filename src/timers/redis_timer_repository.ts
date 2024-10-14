import moment from "moment-timezone"
import { createClient, RedisClientType } from "redis"
import { Repository, Schema } from "redis-om"
import type { Timer } from "../types"
import type { TimerRepository } from "./timer_repository"

type RedisTimerEntity = {
    id: number
    userId: string
    channelId: string
    guildId: string
    startTime: Date
    endTime: Date
    joinTime?: Date
    isComplete: boolean
}

const timerSchema = new Schema<RedisTimerEntity>('timer', {
    id: { type: 'number' },
    userId: { type: 'string' },
    channelId: { type: 'string' },
    guildId: { type: 'string' },
    startTime: { type: 'date' },
    endTime: { type: 'date' },
    joinTime: { type: 'date' },
    isComplete: { type: 'boolean' }
})

export class RedisTimerRepository implements TimerRepository {
    private readonly redis: RedisClientType
    private readonly timerRedisRepository: Repository<RedisTimerEntity>

    constructor(host, port = 6379) {
        this.redis = createClient({ url: `redis://${host}:${port}` })
        this.timerRedisRepository = new Repository(timerSchema, this.redis)
    }

    async init(): Promise<void> {
        await this.redis.connect()
        return this.timerRedisRepository.createIndex()
    }

    async getTimers(userId: string, guildId: string): Promise<Timer[]> {
        const timerEntities = await this.timerRedisRepository.search().where('userId').eq(userId).and('guildId').eq(guildId).return.all()
        return timerEntities.map(this.entityToTimer)
    }

    async getTimersByGuildId(guildId: string): Promise<Timer[]> {
        const timerEntities = await this.timerRedisRepository.search().where('guildId').eq(guildId).return.all()
        return timerEntities.map(this.entityToTimer)
    }

    async saveTimer(timer: Timer): Promise<Timer> {
        const timerEntity = this.timerToEntity(timer)

        if (!timerEntity.id) {
            timerEntity.id = await this.redis.incr('timer_id')
        }

        const entity = await this.timerRedisRepository.save(timerEntity.id.toString(), timerEntity)

        return this.entityToTimer(entity)
    }

    async deleteTimerById(id: number): Promise<void> {
        // await this.timerRedisRepository.remove(id)
    }

    private entityToTimer(entity: RedisTimerEntity): Timer {
        return <Timer>{
            id: entity.id,
            userId: entity.userId,
            channelId: entity.channelId,
            guildId: entity.guildId,
            startTime: moment(entity.startTime),
            endTime: moment(entity.endTime),
            joinTime: entity.joinTime ? moment(entity.joinTime) : null,
            isComplete: entity.isComplete === true
        }
    }

    private timerToEntity(timer: Timer): RedisTimerEntity {
        return <RedisTimerEntity>{
            id: timer.id,
            userId: timer.userId,
            channelId: timer.channelId,
            guildId: timer.guildId,
            startTime: timer.startTime.toDate(),
            endTime: timer.endTime.toDate(),
            joinTime: timer.joinTime?.toDate(),
            isComplete: timer.isComplete
        }
    }
}
