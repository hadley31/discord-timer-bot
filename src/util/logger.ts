import pino from 'pino'
import fs from 'fs'

// Winston does not create logs directory so we need to create it if it does not exist
if (!fs.existsSync('logs/')) {
  fs.mkdirSync('logs/', { recursive: true })
}

const logger = pino({
  transport: {
    targets: [
      {
        level: 'debug',
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
      {
        level: 'info',
        target: 'pino/file',
        options: {
          destination: 'logs/app.log',
        },
      },
      {
        level: 'error',
        target: 'pino/file',
        options: {
          destination: 'logs/error.log',
        },
      },
    ],
  },
})

export default logger
