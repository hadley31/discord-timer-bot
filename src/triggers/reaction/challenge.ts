import type { ReactionTrigger, VoiceTrigger } from "../../types"
import type { TextChannel } from "discord.js"
import { timerService } from "../../services"
import moment from "moment-timezone"
import { calculateTimerEndTime, parseOnAtTime, parseOnInTime } from "../../timers/timer_utils"


const trigger = <ReactionTrigger>{
    name: 'Challenge Timer',
    test: async (reaction, user) => {
        return reaction.emoji.name == '⏲️' || reaction.emoji.name == '⏰'
    },
    execute: async (reaction, user) => {
        if (reaction.message.member.voice.channel != null) {
            console.log('User is already in a voice channel')
            return
        }

        const timer = await timerService.getActiveTimer(reaction.message.author.id, reaction.message.guild.id)

        if (timer) {
            console.log(`User already has an active timer in this guild ending at ${timer.endTime.format('h:mm A z')}`)
            return
        }

        const timerEndTimeFunc = reaction.emoji.name === '⏲️' ? parseOnInTime : parseOnAtTime

        const endTime = timerEndTimeFunc(reaction.message.content)

        if (endTime == null) {
            console.error('Error while parsing time')
            return
        }

        await timerService.createTimer(reaction.message.author.id, reaction.message.channel.id, reaction.message.guild.id, endTime)

        const timeString = endTime.format('h:mm A z')

        reaction.message.reply(`${user} has challenged you. Join the voice channel by **${timeString}** to avoid public shaming.`)
    }
}

export default trigger
