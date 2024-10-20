import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)

export function eventTime(startDate: Date, endDate: Date) {
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  const startEndSameDay = start.format('YYYYMMDD') === end.format('YYYYMMDD')

  if (startEndSameDay) {
    const startDay = start.format('dddd, MMMM D')
    const startTime = start.format('h:mm A')
    const endTime = end.format('h:mm A')
    return `${startDay} ⋅ ${startTime} - ${endTime}`
  } else {
    const startFull = start.format('dddd, MMMM D, h:mm A')
    const endFull = end.format('dddd, MMMM D, h:mm A')
    return `${startFull} - ${endFull}`
  }
}

export function nowToTimestamp(timestamp: Date) {
  const now = dayjs().local()
  const eventStart = dayjs(timestamp)
  return now.to(eventStart)
}

export function fieldsToDayjs(
  dateString: string,
  timeString: string,
  timezoneOffset: number
) {
  const offsetHours = timezoneOffset / 60
  const [year, month, dateOfMonth] = dateString.split('-')
  const [hour, minute] = timeString.split(':')
  return dayjs()
    .utcOffset(-offsetHours)
    .set('year', parseInt(year))
    .set('month', parseInt(month) - 1)
    .set('date', parseInt(dateOfMonth))
    .set('hour', parseInt(hour))
    .set('minute', parseInt(minute))
    .set('second', 0)
}

export function fieldsToDate(
  dateString: string,
  timeString: string,
  timezoneOffset: number
) {
  return fieldsToDayjs(dateString, timeString, timezoneOffset).toDate()
}
