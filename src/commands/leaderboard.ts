import { type ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, userMention, channelMention, Client } from 'discord.js'
import type { Command, DiscordCommandOptions } from '../types'
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

    const sortedUserStats = userStats.sort((a, b) => b.onTimePercentage - a.onTimePercentage)

    const topUsers = sortedUserStats.slice(0, 3)

    const userIdsToUsernames = new Map<string, string>()

    for (const userStat of topUsers) {
      userIdsToUsernames.set(userStat.userId, await this.userIdToUsername(interaction.client, userStat.userId))
    }

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Timer Leaderboard')
          .setDescription('User Timer Stats')
          .addFields([
            ...topUsers.map((userStats, index) => ({
              name: `${index + 1}. ${userIdsToUsernames.get(userStats.userId)}`,
              value: `On Time Percentage: ${(userStats.onTimePercentage * 100).toFixed(0)}%\nTotal Timers: ${
                userStats.totalTimers
              }\nJoin Time Accuracy: ${(userStats.joinTimeAccuracy * 100).toFixed(0)}%`,
              inline: true,
            })),
          ]),
      ],
    })
  }

  private async userIdToUsername(client: Client, userId: string) {
    const user = await client.users.fetch(userId)
    return user.username
  }
}
