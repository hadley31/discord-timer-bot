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
    ]
})

import { textTriggers, voiceTriggers, reactionTriggers } from './triggers'
import { commands } from './commands'

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) {
        return
    }

    for (const command of commands) {
        if (interaction.commandName === command.data.name) {
            await command.execute(interaction)
        }
    }
})

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (user.bot) {
        return
    }

    for (const trigger of reactionTriggers) {
        if (await trigger.test(reaction, user)) {
            await trigger.execute(reaction, user)
        }
    }
})

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) {
        return
    }

    console.log(`${message.author.username} (${message.author.id}) says: ${message.toString()}`)

    for (const trigger of textTriggers) {
        if (await trigger.test(message)) {
            await trigger.execute(message)
        }
    }
})

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    if (oldState.member.user.bot) {
        return
    }

    if (!oldState.channelId && newState.channelId) {
        console.log(`${oldState.member.user.username} (${oldState.member.user.id}) joined voice channel: ${newState.channel.name}`)
    }

    for (const trigger of voiceTriggers) {
        if (await trigger.test(oldState, newState)) {
            await trigger.execute(oldState, newState)
        }
    }
})

client.login(DISCORD_TOKEN)
