import { beforeEach, mock, describe } from 'bun:test'
import { WheelOfNamesClient } from '../wheelofnames/wheel_client'
import { WheelCommand } from './wheel'

mock.module('../wheelofnames/wheel_client', () => ({
  WheelOfNamesClient: mock().mockImplementation(() => ({
    generateWheel: mock().mockResolvedValue('https://wheelofnames.com/testWheel'),
  })),
}))

describe('WheelCommand', () => {
  let wheelCommand: WheelCommand
  beforeEach(() => {
    wheelCommand = new WheelCommand(new WheelOfNamesClient())
  })

  describe('execute', () => {
    // const result = wheelCommand.execute({})
  })
})
