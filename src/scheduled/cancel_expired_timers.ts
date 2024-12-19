import moment from 'moment-timezone'
import { type TimerRepository } from '../timers/timer_repository'
import { Cron } from 'croner'
import { TextChannel, userMention, type Client } from 'discord.js'
import logger from '../util/logger'

export class CancelExpiredTimersCron {
  private readonly timerRepository: TimerRepository
  private readonly client: Client
  private readonly job: Cron

  constructor(timerRepository: TimerRepository, discordClient: Client) {
    this.timerRepository = timerRepository
    this.client = discordClient
    this.job = new Cron('*/15 * * * *', async () => {
      try {
        await this.execute()
      } catch (e) {
        logger.error('Error cancelling expired timers', e)
      }
    })
  }

  async execute() {
    logger.info('Checking for expired timers...')

    const timers = await this.timerRepository.getIncompleteTimersOlderThan(moment().subtract(1, 'hour'))

    timers.forEach(async (timer) => {
      logger.info(`Cancelling expired timer for user ${timer.userId} in channel ${timer.channelId}`)
      const channel = (await this.client.channels.fetch(timer.channelId)) as TextChannel
      const message = await channel.messages.fetch(timer.messageId)

      timer.isComplete = true

      await this.timerRepository.saveTimer(timer)

      await message.reply(`${userMention(timer.userId)} never joined :slight_frown:`)
    })
  }
}
