import { SlashCommandBuilder } from "discord.js"
import type { Command } from "../types"

const command = <Command>{
    data: new SlashCommandBuilder()
        .setName('wheel')
        .setDescription('Spin the wheel!'),
    execute: async (interaction) => {
        const guild = interaction.client.guilds.cache.get(interaction.guildId)
        const members = await guild.members.fetch()
        const member = members.get(interaction.member.user.id)
        const voiceChannel = member.voice?.channel

        if (!voiceChannel) {
            await interaction.reply({ ephemeral: true, content: 'You must be in a voice channel to spin the wheel!' })
            return
        }

        const voiceMembers = voiceChannel.members?.filter(member => !member.user.bot)

        const randomMembers = voiceMembers.random(5)

        interaction.reply(`**Players for the next match:**\n${randomMembers.map((member, index) => `${index + 1}. ${member.toString()}`).join('\n')}`)
    }
}

export default command
