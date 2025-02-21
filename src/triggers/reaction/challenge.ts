import type { DiscordReaction, DiscordUser, ReactionTrigger } from '../../types'
import moment from 'moment-timezone'
import { parseOnAtTime, parseOnInTime } from '../../util/timer_utils'
import { TimerAlreadyExistsError, TimerCreationError } from '../../errors'
import { formatWithTimezone } from '../../util/moment_utils'
import { TimerService } from '../../timers/timer_service'
import { TimerStatsService } from '../../stats/timer_stats_service'
import logger from '../../util/logger'
import { bold } from 'discord.js'

export class ChallengeReactionTrigger implements ReactionTrigger {
  public readonly name: string = 'Challenge Timer'
  private readonly timerService: TimerService
  private readonly timerStatsService: TimerStatsService

  constructor(timerService: TimerService, timerStatsService: TimerStatsService) {
    this.timerService = timerService
    this.timerStatsService = timerStatsService
  }

  async shouldExecute(reaction: DiscordReaction, user: DiscordUser) {
    return reaction.emoji.name == '⏲️' || reaction.emoji.name == '⏰'
  }

  async execute(reaction: DiscordReaction, user: DiscordUser) {
    if (reaction.message.member.voice.channel != null) {
      throw new TimerCreationError('User is already in a voice channel')
    }

    logger.info(`${user.username} reacted with ${reaction.emoji.name} to ${reaction.message.author.username}'s message`)

    const userId = reaction.message.author.id
    const channelId = reaction.message.channel.id
    const guildId = reaction.message.guild.id
    const messageId = reaction.message.id

    const timer = await this.timerService.getActiveTimerByUserId(userId, guildId)

    if (timer) {
      throw new TimerAlreadyExistsError(timer)
    }

    const startTime = moment(reaction.message.createdAt)

    const messageContent = reaction.message.content.replace(/\d{5,}/g, '')

    const endTime = reaction.emoji.name === '⏲️' ? parseOnInTime(messageContent, { startTime }) : parseOnAtTime(messageContent)

    if (!endTime) {
      throw new TimerCreationError(`Could not parse time from message content: ${messageContent}`)
    }

    logger.info(`Starting timer for ${reaction.message.author.username} at ending at ${endTime}`)

    const newTimer = await this.timerService.createTimer({
      userId,
      channelId,
      guildId,
      messageId,
      startTime,
      endTime,
    })

    const timeString = formatWithTimezone(endTime)

    const expectedJoinTime = await this.timerStatsService.getExpectedJoinTime(newTimer)

    const expectedJoinTimeString = formatWithTimezone(expectedJoinTime)

    reaction.message.reply(
      `${user} has challenged you. Join the voice channel by ${bold(timeString)} to avoid public shaming. Expected join time: ${bold(
        expectedJoinTimeString,
      )}`,
    )
  }
}
