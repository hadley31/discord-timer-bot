import { Client, Events, GatewayIntentBits } from 'discord.js'

const { DISCORD_TOKEN } = process.env

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ]
})

import { textTriggers, voiceTriggers } from './triggers'
import { commands } from './commands'

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) {
        return
    }

    for (const command of commands) {
        if (interaction.commandName === command.data.name) {
            await command.execute(interaction)
        }
    }
})

client.on(Events.MessageCreate, async message => {
    console.log(`${message.author.username} (${message.author.id}) says: ${message.toString()}`)
    if (message.author.bot) {
        return
    }

    for (const trigger of textTriggers) {
        if (await trigger.test(message)) {
            await trigger.execute(message)
        }
    }
})

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    for (const trigger of voiceTriggers) {
        if (await trigger.test(oldState, newState)) {
            await trigger.execute(oldState, newState)
        }
    }
})

client.login(DISCORD_TOKEN)
