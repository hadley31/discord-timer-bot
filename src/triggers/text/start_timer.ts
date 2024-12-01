import { timerService } from '../../services'
import type { TextTrigger } from '../../types'
import { ChannelType, type VoiceChannel, type Message } from 'discord.js'
import { calculateTimerEndTime, autoDetectJoinEstimateMessage } from '../../util/timer_utils'
import moment from 'moment-timezone'
import { formatWithTimezone } from '../../util/discord_utils'

const trigger = <TextTrigger>{
  name: 'Start Timer',
  async test(message: Message) {
    return autoDetectJoinEstimateMessage(message.content)
  },
  async execute(message: Message) {
    if (message.member.voice.channel != null) {
      console.log('User is already in a voice channel')
      return
    }

    const timer = await timerService.getActiveTimerByUserId(message.author.id, message.guild.id)

    if (timer) {
      console.log(`User already has an active timer in this guild ending at ${formatWithTimezone(timer.endTime)}`)
      return
    }

    const endTime = calculateTimerEndTime(message.content)

    if (endTime == null) {
      console.error('Error while parsing time')
      return
    }

    const userInVoiceChannel = message.guild.channels.cache
      .filter((channel) => channel.type === ChannelType.GuildVoice)
      .some((channel) => (channel as VoiceChannel).members.size > 0)

    if (!userInVoiceChannel) {
      console.log('No voice channels with members')
      return
    }

    console.log(`Starting timer for ${message.author.username} at ending at ${endTime}`)

    const userId = message.author.id
    const channelId = message.channel.id
    const messageId = message.id
    const guildId = message.guild.id
    const startTime = moment(message.createdAt)

    await timerService.createTimer({
      userId,
      channelId,
      messageId,
      guildId,
      startTime,
      endTime,
    })

    await message.react('⏲️')
  },
}

export default trigger
