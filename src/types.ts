import type {
  ChatInputCommandInteraction,
  Message,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  User,
  VoiceState,
} from 'discord.js'
import { Moment } from 'moment-timezone'

export type Command = {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>
}

export type TextTrigger = {
  name: string
  shouldExecute: (message: Message) => Promise<boolean>
  execute: (interaction: Message) => Promise<void>
}

export type VoiceTrigger = {
  name: string
  shouldExecute: (oldState: VoiceState, newState: VoiceState) => Promise<boolean>
  execute: (oldState: VoiceState, newState: VoiceState) => Promise<void>
}

export type ReactionTrigger = {
  name: string
  shouldExecute: (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => Promise<boolean>
  execute: (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => Promise<void>
}

export type Timer = {
  id: string
  userId: string
  channelId: string
  guildId: string
  messageId: string
  startTime: Moment
  endTime: Moment
  joinTime?: Moment
  isComplete: boolean
}

export type CreateTimerRequest = {
  userId: string
  channelId: string
  guildId: string
  messageId: string
  startTime: Moment
  endTime: Moment
}
