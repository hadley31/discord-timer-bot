import type { VoiceTrigger } from '../../types'
import { userMention, bold, type TextChannel, type VoiceState } from 'discord.js'
import moment from 'moment-timezone'
import { getJoinTimePercentage } from '../../util/timer_utils'
import type { TimerService } from '../../timers/timer_service'

export class EndTimerVoiceTrigger implements VoiceTrigger {
  public readonly name: string = 'End Timer'
  private readonly timerService: TimerService

  constructor(timerService: TimerService) {
    this.timerService = timerService
  }

  async shouldExecute(oldState: VoiceState, newState: VoiceState) {
    if (newState.channelId === null) {
      return false
    }

    const userId = newState.member.id
    const guildId = newState.guild.id

    const timer = await this.timerService.getActiveTimerByUserId(userId, guildId)

    return timer != null && !timer.isComplete && timer.guildId === newState.guild.id
  }

  async execute(oldState: VoiceState, newState: VoiceState) {
    const userId = newState.member.id
    const guildId = newState.guild.id

    let timer = await this.timerService.getActiveTimerByUserId(userId, guildId)

    var joinTime = moment()

    var timerEndTimeStartOfMinute = timer.endTime.clone().startOf('minute')
    var timerEndTimeEndOfMinute = timer.endTime.clone().endOf('minute').add(5, 'seconds')
    var isTooEarly = timer.endTime.diff(joinTime, 'minutes') > 5 && getJoinTimePercentage(timer) < 0.3
    var isEarly = joinTime.isBefore(timerEndTimeStartOfMinute)
    var isLate = joinTime.isAfter(timerEndTimeEndOfMinute)
    var isOnTime = joinTime.isBetween(timerEndTimeStartOfMinute, timerEndTimeEndOfMinute)

    if (isOnTime) {
      joinTime = timer.endTime
    }

    timer.joinTime = joinTime
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

    const originalMessage = await channel.messages.fetch(timer.messageId)

    if (isTooEarly) {
      await originalMessage.reply(`${userMention(userId)} joined ${bold('way too early')}.`)
      return
    }

    if (isEarly) {
      await originalMessage.reply(`${userMention(userId)} joined ${value} ${unit} ${bold('early')}!`)
      return
    }

    if (isLate) {
      await originalMessage.reply(`${userMention(userId)} joined ${value} ${unit} ${bold('late')}!`)
      return
    }

    await originalMessage.reply(`${userMention(userId)} joined on time!`)
  }
}
