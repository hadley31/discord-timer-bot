import type { Timer } from './types'

export class TimerBotError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export class TimerCreationError extends TimerBotError {
  constructor(message: string) {
    super(message)
  }
}

export class TimerNotFoundError extends TimerBotError {
  constructor(message: string) {
    super(message)
  }
}

export class TimerAlreadyExistsError extends TimerCreationError {
  public readonly timer: Timer

  constructor(timer: Timer) {
    super('A timer already exists for user: ' + timer.userId + ' in guild: ' + timer.guildId)
    this.timer = timer
  }
}
