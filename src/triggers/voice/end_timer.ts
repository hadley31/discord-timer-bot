import type { VoiceTrigger } from '../../types'
import type { TextChannel } from 'discord.js'
import { timerService } from '../../services'
import moment from 'moment-timezone'
import { getJoinTimePercentage } from '../../timers/timer_utils'

const trigger = <VoiceTrigger>{
  name: 'End Timer',
  test: async (oldState, newState) => {
    if (newState.channelId === null) {
      return false
    }

    const userId = newState.member.id
    const guildId = newState.guild.id

    const timer = await timerService.getActiveTimerByUserId(userId, guildId)

    return timer != null && !timer.isComplete && timer.guildId === newState.guild.id
  },
  execute: async (oldState, newState) => {
    const userId = newState.member.id
    const guildId = newState.guild.id

    let timer = await timerService.getActiveTimerByUserId(userId, guildId)

    timer.joinTime = moment()
    timer.isComplete = true

    timer = await timerService.saveTimer(timer)

    const channel = (await newState.client.channels.fetch(timer.channelId)) as TextChannel

    const deltaSeconds = timer.endTime.diff(timer.joinTime, 'seconds')
    let value = Math.floor(Math.abs(deltaSeconds))
    let unit = 'seconds'

    if (value > 60) {
      value = Math.round(value / 60)
      unit = 'minutes'
    }

    const earlyOrLate = deltaSeconds > 0 ? 'early' : 'late'

    const message = await channel.messages.fetch(timer.messageId)

    if (timer.endTime.diff(moment(), 'minutes') > 5 && getJoinTimePercentage(timer) < 0.3) {
      await message.reply(`<@${userId}> joined **way too early**. Shame on you!`)
      return
    }

    await message.reply(`<@${userId}> joined ${value} ${unit} **${earlyOrLate}**`)
  },
}

export default trigger
