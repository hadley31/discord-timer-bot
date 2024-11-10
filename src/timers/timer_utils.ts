import moment from "moment-timezone"

const onInRegex = /(?:getting ou?n in|joining in|give me|gimmi?e|i need|i'?ll be|^)\s*(?:around|a?bout|~)?\s*(?:maybe)?\s*(?:like)?\s*(one|two|three|four|five|ten|\d+)\s*(minutes?|mins?|m|hours?|hrs?|h|sec)?(?!late)/i
const onAtRegex = /(?:getting ou?n|joining|i can join|i can|i can play)\s*(?:at|around|a?bout|~)\s*(?:maybe)?\s*(?:like)?\s*([\d:]+\s*)/i

const regexes = [onInRegex, onAtRegex]


type ParseOptions = {
    initialTimestamp?: moment.Moment
}


const parseNumeric = (text: string) => {
    switch (text) {
        case 'one': return 1
        case 'two': return 2
        case 'three': return 3
        case 'four': return 4
        case 'five': return 5
        case 'ten': return 10
        default: return parseInt(text)
    }
}


export const parseOnInTime = (message: string, options: ParseOptions = {}): moment.Moment => {
    const match = onInRegex.exec(message)

    if (!match) {
        return
    }

    let value = parseNumeric(match[1])
    const unit = match[2] || 'm'

    if (unit.startsWith('s')) {
        value = 3
    }
    if (unit.startsWith('h')) {
        value *= 60
    }

    const timestamp = options.initialTimestamp || moment().tz('America/Denver')

    return timestamp.add(value, 'minute').startOf('minute')
}

const createDate = (hour: number, minute: number): moment.Moment => {
    const date = moment().tz('America/Denver')

    const currentHour = date.hour()

    date.hour(hour).minute(minute)

    if (currentHour > hour) {
        date.add(12, 'hour')
    }

    return date
}

export const parseOnAtTime = (message: string): moment.Moment => {
    const match = onAtRegex.exec(message)

    if (!match) {
        return null
    }

    const time = match[1]

    if (time.includes(':')) {
        const [hourOfDay, minuteOfHour] = time.split(':').map(n => parseInt(n))

        return createDate(hourOfDay, minuteOfHour).startOf('minute')
    } else if (time.length <= 2) {
        const hourOfDay = parseInt(time)

        return createDate(hourOfDay, 0).startOf('hour')
    } else {
        let hourOfDay = parseInt(time.slice(0, -2))
        const minuteOfHour = parseInt(time.slice(-2))

        return createDate(hourOfDay, minuteOfHour).startOf('minute')
    }
}

export const calculateTimerEndTime = (message: string, options: ParseOptions = {}): moment.Moment => {
    return parseOnInTime(message, options) || parseOnAtTime(message)
}

export const testRegexes = (message: string): boolean => {
    return regexes.some(regex => regex.test(message))
}
