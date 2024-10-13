import type { VoiceTrigger } from "../../types.ts";
import { timerService } from "../../timers/timer_service";
import { TextChannel } from "discord.js";


const trigger = <VoiceTrigger>{
    name: 'End Timer',
    test: async (oldState, newState) => {
        if (newState.channelId === null) {
            return false
        }

        const userId = newState.member.id
        const guildId = newState.guild.id

        const timer = timerService.getTimer(userId, guildId)

        return timer != null && !timer.isComplete
    },
    execute: async (oldState, newState) => {
        const userId = newState.member.id
        const guildId = newState.guild.id

        const timer = timerService.getTimer(userId, guildId)
        timer.joinTime = new Date()
        timer.isComplete = true

        timerService.saveTimer(timer)

        const channel = await newState.client.channels.fetch(timer.channelId) as TextChannel

        const deltaSeconds = (timer.endTime.getTime() - timer.joinTime.getTime()) / 1000
        let value = Math.floor(Math.abs(deltaSeconds))
        let unit = 'seconds'

        if (value > 60) {
            value = Math.round(value / 60)
            unit = 'minutes'
        }

        const earlyOrLate = deltaSeconds > 0 ? 'early' : 'late'

        channel.send(`<@${userId}> joined ${value} ${unit} **${earlyOrLate}**`)
    }
}

export default trigger
