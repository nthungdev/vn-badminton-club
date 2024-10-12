import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

const eventTime = (startDate: Date, endDate: Date) => {
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

const nowToTimestamp = (timestamp: Date) => {
  const now = dayjs().local()
  const eventStart = dayjs(timestamp)
  return now.to(eventStart)
}

function fieldsToDate(
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
    .toDate()
}

export { eventTime, nowToTimestamp, fieldsToDate }
