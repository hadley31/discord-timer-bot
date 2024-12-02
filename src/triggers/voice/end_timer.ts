import type { VoiceTrigger } from '../../types'
import type { TextChannel } from 'discord.js'
import moment from 'moment-timezone'
import { getJoinTimePercentage } from '../../util/timer_utils'
import type { TimerService } from '../../timers/timer_service'

export class EndTimerVoiceTrigger implements VoiceTrigger {
  public readonly name: string = 'End Timer'
  private readonly timerService: TimerService

  constructor(timerService: TimerService) {
    this.timerService = timerService
  }

  async shouldExecute(oldState, newState) {
    if (newState.channelId === null) {
      return false
    }

    const userId = newState.member.id
    const guildId = newState.guild.id

    const timer = await this.timerService.getActiveTimerByUserId(userId, guildId)

    return timer != null && !timer.isComplete && timer.guildId === newState.guild.id
  }

  async execute(oldState, newState) {
    const userId = newState.member.id
    const guildId = newState.guild.id

    let timer = await this.timerService.getActiveTimerByUserId(userId, guildId)

    timer.joinTime = moment()
    timer.isComplete = true

    timer = await this.timerService.saveTimer(timer)

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
  }
}
