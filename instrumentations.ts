export async function register() {
  const dayjs = await import('dayjs')
  const utc = await import('dayjs/plugin/utc')
  const timezone = await import('dayjs/plugin/timezone')

  dayjs.default.extend(utc.default)
  dayjs.default.extend(timezone.default)
}
