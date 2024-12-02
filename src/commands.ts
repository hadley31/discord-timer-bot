import type { Command } from './types'
import { REST, Routes } from 'discord.js'
import { WheelCommand } from './commands/wheel'
import { wheelOfNamesClient } from './services'

const wheelCommand = new WheelCommand(wheelOfNamesClient)

export const commands: Command[] = [wheelCommand]

export const deployCommands = async () => {
  const token = process.env.DISCORD_TOKEN
  const clientId = process.env.DISCORD_CLIENT_ID
  // const guildId = process.env.DISCORD_GUILD_ID

  const rest = new REST().setToken(token)

  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`)

    const deployCommandsBody = commands.map((command) => command.data.toJSON())

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = (await rest.put(Routes.applicationCommands(clientId), { body: deployCommandsBody })) as any[]

    console.log(`Successfully reloaded ${data.length} application (/) commands.`)
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error)
  }
}

deployCommands()
