import { Client, Events, GatewayIntentBits } from 'discord.js'

const { DISCORD_TOKEN } = process.env

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
  ],
})

import { textTriggers, voiceTriggers, reactionTriggers } from './triggers'
import { commands } from './commands'
import logger from './util/logger'

client.once(Events.ClientReady, (readyClient) => {
  logger.info(`Ready! Logged in as ${readyClient.user.tag}`)
})

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return
  }

  for (const command of commands) {
    try {
      if (interaction.commandName === command.data.name) {
        await command.execute(interaction)
      }
    } catch (e) {
      logger.error(e)
    }
  }
})

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot) {
    return
  }

  for (const trigger of reactionTriggers) {
    try {
      if (await trigger.shouldExecute(reaction, user)) {
        await trigger.execute(reaction, user)
      }
    } catch (e) {
      logger.error(e)
    }
  }
})

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) {
    return
  }

  logger.info(`${message.author.username} (${message.author.id}) says: ${message.toString()}`)

  for (const trigger of textTriggers) {
    try {
      if (await trigger.shouldExecute(message)) {
        await trigger.execute(message)
      }
    } catch (e) {
      logger.error(e)
    }
  }
})

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  if (oldState.member.user.bot) {
    return
  }

  if (!oldState.channelId && newState.channelId) {
    logger.info(`${oldState.member.user.username} (${oldState.member.user.id}) joined voice channel: ${newState.channel.name}`)
  }

  for (const trigger of voiceTriggers) {
    try {
      if (await trigger.shouldExecute(oldState, newState)) {
        await trigger.execute(oldState, newState)
      }
    } catch (e) {
      logger.error(e)
    }
  }
})

client.login(DISCORD_TOKEN)
