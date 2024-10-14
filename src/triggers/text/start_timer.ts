import moment = require('moment-timezone')
import { timerService } from '../../timers/timer_service'
import type { TextTrigger } from '../../types.ts'
import { ChannelType, VoiceChannel, type Message } from 'discord.js'

const onInRegex = /(?:in|me|gimmi?e|need|maybe|^)\s*(?:around|a?bout|~)?\s*(?:like)?\s*(one|two|three|four|five|ten|\d+)\s*(minutes?|mins?|m|hours?|hrs?|h|sec)?/i
const onAtRegex = /(?:ou?n|joining|join|can|play)\s*(?:at|around|a?bout|~)\s*(?:like)?\s*([\d:]+\s*)/i

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


const execOnInRegex = (message: string): moment.Moment => {
    const match = onInRegex.exec(message)

    if (!match) {
        return
    }

    let value = parseNumeric(match[1])
    const unit = match[2] || 'm'

    console.log(`${match[1]}, ${match[2]}`)

    if (unit.startsWith('s')) {
        value = 3
    }
    if (unit.startsWith('h')) {
        value *= 60
    }

    return moment().tz('America/Denver').add(value, 'minute').startOf('minute')
}

const execOnAtRegex = (message: string): moment.Moment => {
    const match = onAtRegex.exec(message)

    if (!match) {
        return null
    }

    const time = match[1]

    if (time.includes(':')) {
        const [hourOfDay, minuteOfHour] = time.split(':').map(n => parseInt(n))

        const date = moment().tz('America/Denver')
        date.hour(hourOfDay).minute(minuteOfHour)

        return date.startOf('minute')
    } else if (time.length <= 2) {
        const hourOfDay = parseInt(time)

        const date = moment().tz('America/Denver')

        if (date.hour() > hourOfDay) {
            date.hours(hourOfDay)
        }

        return date.startOf('hour')
    } else {
        let hourOfDay = parseInt(time.slice(0, -2))
        const minuteOfHour = parseInt(time.slice(-2))

        const date = moment()
            .tz('America/Denver')

        const currentHour = date.hour()

        date.hour(hourOfDay).minute(minuteOfHour)

        if (currentHour % 12 >= hourOfDay) {
            date.add(12, 'hour')
        }

        return date.startOf('minute')
    }
}

const regexExecs = [execOnInRegex, execOnAtRegex]

const calculateJoinTime = (message: string): moment.Moment => {
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

        const timer = timerService.getActiveTimer(message.author.id, message.guild.id)

        if (timer) {
            console.log('User already has an active timer in this guild')
            return
        }

        const endTime = calculateJoinTime(message.content)

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

        timerService.createTimer(message.author.id, message.channel.id, message.guild.id, endTime)

        const timeString = endTime.format('h:mm A z')

        message.reply(`A timer has been started. Join the voice channel by **${timeString}** to avoid public shaming.`)
    }
}

export default trigger
