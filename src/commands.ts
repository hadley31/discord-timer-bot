import type { Command } from './types'
import { REST, Routes } from 'discord.js'
import { WheelCommand } from './commands/wheel'
import { timerStatsService, wheelOfNamesClient } from './services'
import logger from './util/logger'
import { LeaderboardCommand } from './commands/leaderboard'

const wheelCommand = new WheelCommand(wheelOfNamesClient)
const leaderboardCommand = new LeaderboardCommand(timerStatsService)

export const commands: Command[] = [wheelCommand, leaderboardCommand]

export const deployCommands = async () => {
  const token = process.env.DISCORD_TOKEN
  const clientId = process.env.DISCORD_CLIENT_ID
  const guildId = process.env.DISCORD_GUILD_ID

  const rest = new REST().setToken(token)

  try {
    logger.info(`Started refreshing ${commands.length} application (/) commands.`)

    const deployCommandsBody = commands.map((command) => command.data.toJSON())

    if (process.env.NODE_ENV === 'production') {
      const data = (await rest.put(Routes.applicationCommands(clientId), { body: deployCommandsBody })) as any[]
      logger.info(`Successfully reloaded ${data.length} application (/) commands to all guilds.`)
    } else if (guildId) {
      const data = (await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: deployCommandsBody })) as any[]
      logger.info(`Successfully reloaded ${data.length} application (/) commands to guild: ${guildId}`)
    } else {
      logger.warn('Bot is not running in a production environment and DISCORD_GUILD_ID is not specified. Skipping deploying commands.')
    }
  } catch (error) {
    logger.error(error)
  }
}

deployCommands()
