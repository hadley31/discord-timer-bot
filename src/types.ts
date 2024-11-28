import type { ChatInputCommandInteraction, Message, MessageReaction, PartialMessageReaction, PartialUser, SlashCommandBuilder, User, VoiceState } from "discord.js"
import { Moment } from 'moment'

export type Command = {
    data: SlashCommandBuilder
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>
}

export type TextTrigger = {
    name: string
    test: (message: Message) => Promise<boolean>
    execute: (interaction: Message) => Promise<void>
}

export type VoiceTrigger = {
    name: string
    test: (oldState: VoiceState, newState: VoiceState) => Promise<boolean>
    execute: (oldState: VoiceState, newState: VoiceState) => Promise<void>
}

export type ReactionTrigger = {
    name: string
    test: (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => Promise<boolean>
    execute: (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => Promise<void>
}

export type Timer = {
    id: number
    userId: string
    channelId: string
    guildId: string
    messageId: string
    startTime: Moment
    endTime: Moment
    joinTime?: Moment
    isComplete: boolean
}
