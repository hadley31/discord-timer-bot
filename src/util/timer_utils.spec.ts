import { expect, test, describe } from 'bun:test'
import { autoDetectJoinEstimateMessage } from '../util/timer_utils'

describe('autoDetectJoinEstimateMessage', async () => {
  describe("getting 'on in' messages", async () => {
    const expectTrueMessages = [
      'gimme 5 minutes',
      'gimmie 20 min',
      'i can join in 10 mins',
      'joining in like 25',
      'sure give me about like ~2 minutes',
      "i'll be on in 5 minutes",
      'ill be bout like 8 mins',
      'getting oun in around 45 minutes',
      'i need like 10 minutes',
      'i need 5 minutes',
      'i need another 10 min',
      "i'll need around 2 hours",
      'i can game in like 2 hours',
      'i can play 10 minutes',
      'getting oun, like 5 mins',
      'getting on, 5 mins',
      'cs in 10 min',
      'cs2 10 mins',
      'cs2 in 20 minutes',
    ]

    for (const message of expectTrueMessages) {
      test(`should return true for messages containing '${message}'`, async () => {
        const result = autoDetectJoinEstimateMessage(message)
        expect(result).toBe(true)
      })
    }

    const expectFalseMessages = ["can't join tonight", 'not sure I can join']

    for (const message of expectFalseMessages) {
      test(`should return true for messages containing '${message}'`, async () => {
        const result = autoDetectJoinEstimateMessage(message)
        expect(result).toBe(false)
      })
    }
  })

  describe("getting 'on at' messages", async () => {
    const expectTrueMessages = [
      'getting on at 5',
      'i can join at 10:00',
      'joining at 510',
      'i can join around 5:30',
      'i can at 10',
      'i can around 6:30',
      'joining around 8',
    ]

    for (const message of expectTrueMessages) {
      test(`should return true for messages containing '${message}'`, async () => {
        const result = autoDetectJoinEstimateMessage(message)
        expect(result).toBe(true)
      })
    }

    const expectFalseMessages = ["can't join tonight", 'not sure I can join']

    for (const message of expectFalseMessages) {
      test(`should return true for messages containing '${message}'`, async () => {
        const result = autoDetectJoinEstimateMessage(message)
        expect(result).toBe(false)
      })
    }
  })
})
