import { Events } from 'discord.js'

const { DISCORD_TOKEN } = process.env

import { textTriggers, voiceTriggers, reactionTriggers } from './triggers'
import { commands } from './commands'
import logger from './util/logger'
import { client } from './discord'
import { TimerCreationError } from './errors'

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
      handleTimerError(e)
    }
  }
})

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot) {
    return
  }

  if (reaction.message.author.bot) {
    return
  }

  for (const trigger of reactionTriggers) {
    try {
      if (await trigger.shouldExecute(reaction, user)) {
        await trigger.execute(reaction, user)
      }
    } catch (e) {
      handleTimerError(e)
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
      handleTimerError(e)
    }
  }
})

client.on(Events.MessageDelete, async (message) => {
  if (message.author.id !== client.user.id) {
    return
  }

  logger.info(`A message was deleted: ${message.content}`)
  message.channel.send(`A message was deleted:\n> ${message.content}`)
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

const handleTimerError = (error: unknown) => {
  if (error instanceof TimerCreationError) {
    logger.warn(error)
  } else {
    logger.error(error)
  }
}

client.login(DISCORD_TOKEN)
