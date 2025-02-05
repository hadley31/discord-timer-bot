import { expect, test, describe, it } from 'bun:test'
import { autoDetectJoinEstimateMessage, parseOnInTime, testOnInRegexes } from '../util/timer_utils'
import moment from 'moment-timezone'

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
      "i'll need another 10 minutes",
      'i need another like 6 mins',
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

describe('parseOnInTime', async () => {
  const startTime = moment('2021-01-01 00:00:00')
  const messages = {
    'gimme 5 minutes': 5,
    'gimmie 20 min': 20,
    'i can join in 10 mins': 10,
    'joining in like 25': 25,
    'sure give me about like ~2 minutes': 2,
    "i'll be on in 5 minutes": 5,
    'ill be bout like 8 mins': 8,
    'getting oun in around 45 minutes': 45,
    'i need like 10 minutes': 10,
    'i need 5 minutes': 5,
    'i need another 10 min': 10,
    "i'll need around 2 hours": 120,
    'i can game in like 2 hours': 120,
    'i can play 10 minutes': 10,
    'getting oun, like 5 mins': 5,
    'getting on, 5 mins': 5,
    'cs in 10 min': 10,
    'cs2 10 mins': 10,
    'cs2 in 20 minutes': 20,
    "i'll need another 10 minutes": 10,
    'i need another like 6 mins': 6,
    'i can join in 1.5 hours': 90,
    'Can I play a premo with yall in 45-hour?': 45,
    'I can play soon': 15,
  }

  for (const [message, minutes] of Object.entries(messages)) {
    describe(`when the message is '${message}'`, async () => {
      it(`should return ${minutes} minutes later`, async () => {
        const expected = startTime.clone().add(minutes, 'minutes')

        const result = parseOnInTime(message, { startTime })

        expect(result).toEqual(expected)
      })
    })
  }
})

describe('parseOnAtTime', async () => {
  describe('', async () => {})
})

describe('testPresetDurations', async () => {
  describe('when the message contains a preset duration', async () => {
    it('should return 90 minutes', async () => {
      const result = testOnInRegexes("I'll be on in an hour and a half")

      expect(result).toBe(90)
    })

    it('should return 150 minutes', async () => {
      const result = testOnInRegexes("I'll be on in an two and a half hours")

      expect(result).toBe(150)
    })

    it('should return 210 minutes', async () => {
      const result = testOnInRegexes("I'll be on in an three and a half hours")

      expect(result).toBe(210)
    })

    it('should return 150 minutes', async () => {
      const result = testOnInRegexes("I'll be on in an 2 and a half hours")

      expect(result).toBe(150)
    })
  })
})
