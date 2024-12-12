import pino from 'pino'
import fs from 'fs'

// Winston does not create logs directory so we need to create it if it does not exist
if (!fs.existsSync('logs/')) {
  fs.mkdirSync('logs/', { recursive: true })
}

const logger = pino()

export default logger
