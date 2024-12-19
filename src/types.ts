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

export type DiscordReaction = MessageReaction | PartialMessageReaction
export type DiscordUser = User | PartialUser
export type DiscordCommandOptions = SlashCommandBuilder | SlashCommandOptionsOnlyBuilder

export type Command = {
  data: DiscordCommandOptions
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
  shouldExecute: (reaction: DiscordReaction, user: DiscordUser) => Promise<boolean>
  execute: (reaction: DiscordReaction, user: DiscordUser) => Promise<void>
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

export type UserStats = {
  userId: string
  totalTimers: number
  onTimePercentage: number
  joinTimeAccuracy: number
  expiredTimers: number
}

export type CreateTimerRequest = {
  userId: string
  channelId: string
  guildId: string
  messageId: string
  startTime: Moment
  endTime: Moment
}
