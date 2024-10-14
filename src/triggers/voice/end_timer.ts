import type { VoiceTrigger } from "../../types.ts";
import { timerService } from "../../timers/timer_service";
import { TextChannel } from "discord.js";
import moment = require("moment-timezone");


const trigger = <VoiceTrigger>{
    name: 'End Timer',
    test: async (oldState, newState) => {
        if (newState.channelId === null) {
            return false
        }

        const userId = newState.member.id
        const guildId = newState.guild.id

        const timer = timerService.getActiveTimer(userId, guildId)

        return timer != null && !timer.isComplete
    },
    execute: async (oldState, newState) => {
        const userId = newState.member.id
        const guildId = newState.guild.id

        const timer = timerService.getActiveTimer(userId, guildId)
        timer.joinTime = moment()
        timer.isComplete = true

        timerService.saveTimer(timer)

        const channel = await newState.client.channels.fetch(timer.channelId) as TextChannel

        const deltaSeconds = timer.endTime.diff(timer.joinTime, 'seconds')
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
