import { type ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, userMention, channelMention, Client, bold } from 'discord.js'
import type { Command, DiscordCommandOptions, UserStats } from '../types'
import { TimerStatsService } from '../stats/timer_stats_service'

export class LeaderboardCommand implements Command {
  private readonly timerStatsService: TimerStatsService
  public readonly data: DiscordCommandOptions

  constructor(timerStatsService: TimerStatsService) {
    this.data = new SlashCommandBuilder().setName('leaderboard').setDescription('Get the leaderboard for timers in this guild')
    this.timerStatsService = timerStatsService
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const userStats = await this.timerStatsService.getTimerStatsByGuildId(interaction.guildId)

    const sortedUserStats = userStats.sort((a, b) => b.joinTimeAccuracy - a.joinTimeAccuracy)

    const topUsers = sortedUserStats.slice(0, 3)

    const userIdsToUsernames = await this.createUserIdsToUsernamesMap(interaction, topUsers)

    interaction.reply({
      embeds: [
        new EmbedBuilder().setTitle('Timer Leaderboard').addFields([
          ...topUsers.map((userStats, index) => ({
            name: `${index + 1}. ${userIdsToUsernames.get(userStats.userId)}`,
            value: this.timerStatsToEmbedFields(userStats),
            inline: true,
          })),
        ]),
      ],
    })
  }

  private timerStatsToEmbedFields(userStats: UserStats): string {
    const onTimePercentage = (userStats.onTimePercentage * 100).toFixed(0)
    const joinTimeAccuracy = (userStats.joinTimeAccuracy * 100).toFixed(0)

    const fields = {
      'Total Timers': userStats.totalTimers.toString(),
      'On Time Percentage': `${onTimePercentage}%`,
      'Join Time Accuracy': `${joinTimeAccuracy}%`,
      'Expired Timers': userStats.expiredTimers.toString(),
    }

    return Object.entries(fields)
      .map(([name, value]) => `${name}: ${bold(value)}`)
      .join('\n')
  }

  private async createUserIdsToUsernamesMap(interaction: ChatInputCommandInteraction, userStats: UserStats[]): Promise<Map<string, string>> {
    const result = new Map<string, string>()

    for (const userStat of userStats) {
      const username = await interaction.guild.members.fetch(userStat.userId).then((member) => member.displayName)
      result.set(userStat.userId, username)
    }

    return result
  }
}
