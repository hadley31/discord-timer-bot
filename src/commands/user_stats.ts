import { type ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, userMention, channelMention, Client } from 'discord.js'
import type { Command, DiscordCommandOptions } from '../types'
import { TimerStatsService } from '../stats/timer_stats_service'

export class UserStatsCommand implements Command {
  private readonly timerStatsService: TimerStatsService
  public readonly data: DiscordCommandOptions

  constructor(timerStatsService: TimerStatsService) {
    this.data = new SlashCommandBuilder()
      .setName('stats')
      .setDescription('Get the leaderboard for timers for a user')
      .addUserOption((option) => option.setName('user').setDescription('The user to get stats for').setRequired(false))
      .addBooleanOption((option) => option.setName('silent').setDescription('Only you can see the user stats').setRequired(false))
    this.timerStatsService = timerStatsService
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const silentOption = interaction.options.getBoolean('silent') ?? false
    const user = interaction.options.getUser('user') ?? interaction.user
    const userStats = await this.timerStatsService.getTimerStatsByUserId(user.id, interaction.guildId)

    interaction.reply({
      embeds: [
        new EmbedBuilder().setTitle(`${user.displayName}'s Timer Stats`).addFields([
          {
            name: 'Total Timers',
            value: `${userStats.totalTimers}`,
          },
          {
            name: 'On Time Percentage',
            value: `${(userStats.onTimePercentage * 100).toFixed(0)}%`,
          },
          {
            name: 'Join Time Accuracy',
            value: `${(userStats.joinTimeAccuracy * 100).toFixed(0)}%`,
          },
          {
            name: 'Expired Timers',
            value: `${userStats.expiredTimers}`,
          },
        ]),
      ],
      ephemeral: silentOption,
    })
  }
}
