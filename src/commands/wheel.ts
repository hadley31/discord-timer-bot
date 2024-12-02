import { type ChatInputCommandInteraction, SlashCommandBuilder, type SlashCommandOptionsOnlyBuilder } from 'discord.js'
import type { Command, DiscordCommandOptions } from '../types'
import { WheelOfNamesClient } from '../wheelofnames/wheel_client'

export class WheelCommand implements Command {
  public readonly data: DiscordCommandOptions
  private readonly wheelOfNamesClient: WheelOfNamesClient

  constructor(wheelOfNamesClient: WheelOfNamesClient) {
    this.data = new SlashCommandBuilder()
      .setName('wheel')
      .setDescription('Spin the wheel!')
      .addBooleanOption((option) => option.setName('web').setDescription('Use the web interface').setRequired(false))
    this.wheelOfNamesClient = wheelOfNamesClient
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.client.guilds.cache.get(interaction.guildId)
    const members = await guild.members.fetch()
    const member = members.get(interaction.member.user.id)
    const voiceChannel = member.voice?.channel

    if (!voiceChannel) {
      await interaction.reply({ ephemeral: true, content: 'You must be in a voice channel to spin the wheel!' })
      return
    }

    const voiceMembers = voiceChannel.members?.filter((member) => !member.user.bot)

    const useWeb = interaction.options.getBoolean('web')

    if (useWeb) {
      const url = await this.wheelOfNamesClient.generateWheel(
        interaction.guild.name,
        voiceMembers.map((m) => m.displayName),
      )
      interaction.reply('Generated new wheel of names: ' + url)
      return
    }

    const randomMembers = voiceMembers.random(5)

    interaction.reply(`**Players for the next match:**\n${randomMembers.map((member, index) => `${index + 1}. ${member.toString()}`).join('\n')}`)
  }
}
