import { timerService } from 'timers/timer_service'
import type { TextTrigger } from '../../types'
import { ChannelType, VoiceChannel, type Message } from 'discord.js'

const onInRegex = /(?:in|me|gimmie|need|^)\s*(?:like|around|a?bout|~)?\s*(one|two|three|four|five|ten|\d+)\s*(minutes?|mins?|m|hours?|hrs?|h)?/i
const onAtRegex = /(?:ou?n|joining|join)\s*(?:at|around|a?bout|~)\s*([\d:]+\s*)/i

const regexes = [onInRegex, onAtRegex]


const parseNumeric = (text: string) => {
    switch (text) {
        case 'one': return 1
        case 'two': return 2
        case 'three': return 3
        case 'four': return 4
        case 'five': return 5
        case 'ten': return 10
        default: return parseInt(text)
    }
}


const execOnInRegex = (message: string): Date => {
    const match = onInRegex.exec(message)

    if (!match) {
        return
    }

    let minutes = parseNumeric(match[1])
    const unit = match[2] || 'm'

    console.log(`${match[1]}, ${match[2]}`)

    if (unit.startsWith('h')) {
        minutes *= 60
    }

    return new Date(Date.now() + minutes * 60 * 1000)
}

const execOnAtRegex = (message: string): Date => {
    const match = onAtRegex.exec(message)

    if (!match) {
        return null
    }

    const time = match[1]

    if (time.includes(':')) {
        const [hours, minutes] = time.split(':').map(n => parseInt(n))

        const date = new Date()
        date.setHours(hours, minutes, 0, 0)

        return date
    } else {
        const hours = parseInt(time)

        const date = new Date()
        date.setHours(hours, 0, 0, 0)

        return date
    }
}

const regexExecs = [execOnInRegex, execOnAtRegex]

const calculateJoinTime = (message: string): Date => {
    for (const execRegex of regexExecs) {
        const time = execRegex(message)

        if (time) {
            return time
        }
    }

    return null
}

const trigger = <TextTrigger>{
    name: 'Start Timer',
    async test(message: Message) {
        return regexes.some(regex => regex.test(message.content))
    },
    async execute(message: Message) {
        if (message.member.voice.channel != null) {
            console.log('User is already in a voice channel')
            return
        }

        const timer = timerService.getTimer(message.author.id, message.guild.id)

        if (timer) {
            console.log('User already has a timer')
            return
        }

        const userInVoiceChannel = message.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).some(channel => (channel as VoiceChannel).members)

        if (!userInVoiceChannel) {
            console.log('No voice channels with members')
            return
        }

        const endTime = calculateJoinTime(message.content)

        if (endTime == null) {
            console.error('Could not parse time')
            return
        }

        console.log(`Starting timer for ${message.author.username} at ending at ${endTime}`)

        timerService.createTimer(message.author.id, message.channel.id, message.guild.id, endTime)

        const timeString = endTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            timeZone: 'America/Denver',
            timeZoneName: 'shortGeneric'
        })

        message.reply(`A timer has been started. Join the voice channel by **${timeString}** to avoid public shaming.`)
    }
}

export default trigger
