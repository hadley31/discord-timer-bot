import { timerService, timerStatsService } from './services'
import type { ReactionTrigger, TextTrigger, VoiceTrigger } from './types'

// Import Text Triggers
import { StartTimerTextTrigger } from './triggers/text/start_timer'

// Import Voice Triggers
import { EndTimerVoiceTrigger } from './triggers/voice/end_timer'

// Import Reaction Triggers
import { ChallengeReactionTrigger } from './triggers/reaction/challenge'

// Export Text Triggers
const startTimerTextTrigger = new StartTimerTextTrigger(timerService)

export const textTriggers: TextTrigger[] = [startTimerTextTrigger]

// Export Voice Triggers
const endTimerVoiceTrigger = new EndTimerVoiceTrigger(timerService)

export const voiceTriggers: VoiceTrigger[] = [endTimerVoiceTrigger]

// Export Reaction Triggers
const challengeReactionTrigger = new ChallengeReactionTrigger(timerService, timerStatsService)

export const reactionTriggers: ReactionTrigger[] = [challengeReactionTrigger]
