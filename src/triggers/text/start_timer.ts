import moment from 'moment-timezone'
import { timerService } from '../../services'
import type { TextTrigger } from '../../types'
import { ChannelType, type VoiceChannel, type Message } from 'discord.js'
import { calculateTimerEndTime, testRegexes } from '../../timers/timer_utils'

const trigger = <TextTrigger>{
    name: 'Start Timer',
    async test(message: Message) {
        return false
    },
    async execute(message: Message) {
        if (message.member.voice.channel != null) {
            console.log('User is already in a voice channel')
            return
        }

        const timer = await timerService.getActiveTimer(message.author.id, message.guild.id)

        if (timer) {
            console.log(`User already has an active timer in this guild ending at ${timer.endTime.format('h:mm A z')}`)
            return
        }

        const endTime = calculateTimerEndTime(message.content)

        if (endTime == null) {
            console.error('Error while parsing time')
            return
        }

        const userInVoiceChannel = message.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).some(channel => (channel as VoiceChannel).members.size > 0)

        if (!userInVoiceChannel) {
            console.log('No voice channels with members')
            return
        }

        console.log(`Starting timer for ${message.author.username} at ending at ${endTime}`)

        await timerService.createTimer(message.author.id, message.channel.id, message.guild.id, endTime)

        await message.react('⏲️')

        // const timeString = endTime.format('h:mm A z')

        // await message.reply(`A timer has been started. Join the voice channel by **${timeString}** to avoid public shaming.`)
    }
}

export default trigger
