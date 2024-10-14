import { SlashCommandBuilder } from "discord.js"
import type { Command } from "../types"


async function generateWheel(guildName: string, usernames: string[]) {
    const { WHEEL_API_KEY } = process.env;
    const url = 'https://wheelofnames.com/api/v1/wheels/shared';
    const wheel = {
        shareMode: 'copyable',
        wheelConfig: {
            title: guildName,
            description: 'Randomly select players for the next match',
            entries: usernames.map(username => ({ text: username })),
        },
    };

    const headers = {
        'Content-Type': 'application/json',
        'x-api-key': WHEEL_API_KEY,
    };

    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(wheel),
    });

    const jsonResponse = await response.json();

    if (!jsonResponse?.data?.path) {
        throw new Error('Response not OK');
    }

    const path = jsonResponse.data.path;
    return `https://wheelofnames.com/${path}`;
}

const command = <Command>{
    data: new SlashCommandBuilder()
        .setName('wheel')
        .setDescription('Spin the wheel!')
        .addBooleanOption(
            option => option.setName('web')
                .setDescription('Use the web interface')
                .setRequired(false)
        ),
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

        const useWeb = interaction.options.getBoolean('web')

        if (useWeb) {
            const url = await generateWheel(interaction.guild.name, randomMembers.map(m => m.displayName))
            interaction.reply('Generated new wheel of names: ' + url)
            return
        }

        interaction.reply(`**Players for the next match:**\n${randomMembers.map((member, index) => `${index + 1}. ${member.toString()}`).join('\n')}`)
    }
}

export default command
