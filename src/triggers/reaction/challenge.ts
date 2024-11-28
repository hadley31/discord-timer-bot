import type { ReactionTrigger } from "../../types"
import { timerService, timerStatsService } from "../../services"
import moment from "moment-timezone"
import { parseOnAtTime, parseOnInTime } from "../../timers/timer_utils"


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

        const userId = reaction.message.author.id
        const channelId = reaction.message.channel.id
        const guildId = reaction.message.guild.id
        const messageId = reaction.message.id

        const timer = await timerService.getActiveTimerByUserId(userId, guildId)

        if (timer) {
            console.log(`User already has an active timer in this guild ending at ${timer.endTime.format('h:mm A z')}`)
            return
        }

        const initialTimestamp = moment.unix(reaction.message.createdTimestamp / 1000).tz('America/Denver')

        const messageContent = reaction.message.content

        const endTime = reaction.emoji.name === '⏲️'
            ? parseOnInTime(messageContent, { initialTimestamp })
            : parseOnAtTime(messageContent)

        if (endTime == null) {
            console.error('Error while parsing time')
            return
        }

        console.log(`Starting timer for ${reaction.message.author.username} at ending at ${endTime}`)

        const newTimer = await timerService.createTimer(userId, channelId, guildId, messageId, endTime)

        const timeString = endTime.format('h:mm A z')

        const expectedJoinTime = await timerStatsService.getExpectedJoinTime(newTimer)
        const expectedJoinTimeString = expectedJoinTime.tz('America/Denver').format('h:mm A z')

        reaction.message.reply(`${user} has challenged you. Join the voice channel by **${timeString}** to avoid public shaming. Expected join time: **${expectedJoinTimeString}**`)
    }
}

export default trigger
