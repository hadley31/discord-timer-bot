import type { TextTrigger } from '../../types'
import { ChannelType, type VoiceChannel, type Message } from 'discord.js'
import { calculateTimerEndTime, autoDetectJoinEstimateMessage } from '../../util/timer_utils'
import moment from 'moment-timezone'
import type { TimerService } from '../../timers/timer_service'
import { TimerAlreadyExistsError, TimerCreationError } from '../../errors'
import logger from '../../util/logger'

export class StartTimerTextTrigger implements TextTrigger {
  public readonly name: string = 'Start Timer'
  private readonly timerService: TimerService

  constructor(timerService: TimerService) {
    this.timerService = timerService
  }

  async shouldExecute(message: Message) {
    return autoDetectJoinEstimateMessage(message.content)
  }

  async execute(message: Message) {
    if (message.member.voice.channel != null) {
      throw new TimerCreationError('User is already in a voice channel')
    }

    const timer = await this.timerService.getActiveTimerByUserId(message.author.id, message.guild.id)

    if (timer) {
      throw new TimerAlreadyExistsError(timer)
    }

    const endTime = calculateTimerEndTime(message.content.replace(/\d{5,}/g, ''))

    if (endTime == null) {
      throw new TimerCreationError(`Unable to parse end time from user message: '${message.content}'`)
    }

    const userInVoiceChannel = message.guild.channels.cache
      .filter((channel) => channel.type === ChannelType.GuildVoice)
      .some((channel) => (channel as VoiceChannel).members.size > 0)

    if (!userInVoiceChannel) {
      throw new TimerCreationError('There must be at least one user in a voice channel to automatically start a timer')
    }

    logger.info(`Starting timer for ${message.author.username} at ending at ${endTime}`)

    const userId = message.author.id
    const channelId = message.channel.id
    const messageId = message.id
    const guildId = message.guild.id
    const startTime = moment(message.createdAt)

    await this.timerService.createTimer({
      userId,
      channelId,
      messageId,
      guildId,
      startTime,
      endTime,
    })

    await message.react('⏲️')
  }
}
