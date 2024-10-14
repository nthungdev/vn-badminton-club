export async function register() {
  const dayjs = await import('dayjs')
  const utc = await import('dayjs/plugin/utc')
  const timezone = await import('dayjs/plugin/timezone')
  const relativeTime = await import('dayjs/plugin/relativeTime')

  dayjs.default.extend(utc.default)
  dayjs.default.extend(timezone.default)
  dayjs.default.extend(relativeTime.default)
}
