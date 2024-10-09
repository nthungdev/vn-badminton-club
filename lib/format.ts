import dayjs from "dayjs"

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

export { eventTime, nowToTimestamp }