// Text Triggers
import startTimer from './triggers/text/start_timer'

// Voice Triggers
import endTimer from './triggers/voice/end_timer'

// Reaction Triggers
import challenge from './triggers/reaction/challenge'

export const textTriggers = [startTimer]

export const voiceTriggers = [endTimer]

export const reactionTriggers = [challenge]
