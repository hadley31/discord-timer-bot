import type { ReactionTrigger } from '../../types'
import { timerService, timerStatsService } from '../../services'
import moment from 'moment-timezone'
import { parseOnAtTime, parseOnInTime } from '../../timers/timer_utils'
import { TimerAlreadyExistsError, TimerCreationError } from '../../errors'

const trigger = <ReactionTrigger>{
  name: 'Challenge Timer',
  test: async (reaction, user) => {
    return reaction.emoji.name == '⏲️' || reaction.emoji.name == '⏰'
  },
  execute: async (reaction, user) => {
    if (reaction.message.member.voice.channel != null) {
      throw new TimerCreationError('User is already in a voice channel')
    }

    const userId = reaction.message.author.id
    const channelId = reaction.message.channel.id
    const guildId = reaction.message.guild.id
    const messageId = reaction.message.id

    const timer = await timerService.getActiveTimerByUserId(userId, guildId)

    if (timer) {
      throw new TimerAlreadyExistsError(timer)
    }

    const startTime = moment.unix(reaction.message.createdTimestamp / 1000).tz('America/Denver')

    const messageContent = reaction.message.content

    const endTime = reaction.emoji.name === '⏲️' ? parseOnInTime(messageContent, { startTime }) : parseOnAtTime(messageContent)

    if (!endTime) {
      throw new TimerCreationError('Could not parse time from message content: ' + messageContent)
    }

    console.log(`Starting timer for ${reaction.message.author.username} at ending at ${endTime}`)

    const newTimer = await timerService.createTimer({
      userId,
      channelId,
      guildId,
      messageId,
      startTime,
      endTime,
    })

    const timeString = endTime.format('h:mm A z')

    const expectedJoinTime = await timerStatsService.getExpectedJoinTime(newTimer)

    const expectedJoinTimeString = expectedJoinTime.tz('America/Denver').format('h:mm A z')

    reaction.message.reply(
      `${user} has challenged you. Join the voice channel by **${timeString}** to avoid public shaming. Expected join time: **${expectedJoinTimeString}**`,
    )
  },
}

export default trigger
