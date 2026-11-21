/**
 * The host time zone. Every time the web shows is in this zone, whatever zone
 * the browser is in. It is a constant because no endpoint returns it.
 */
export const HOST_TIME_ZONE = 'Europe/Moscow';

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: HOST_TIME_ZONE,
  hourCycle: 'h23',
  hour: '2-digit',
  minute: '2-digit',
});

// A plain date names a day and no moment, so it is read and written in UTC
// and never shifts with the zone of the browser.
const dayFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

/** The time of day of a timestamp in the host time zone, as in `09:00`. */
export function formatHostTime(timestamp: string): string {
  const parts = timeFormat.formatToParts(new Date(timestamp));
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return `${read('hour')}:${read('minute')}`;
}

// The en-CA locale writes a date as 2026-11-23, the way the contract does.
const hostDateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: HOST_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/**
 * An interval between two timestamps with its day in the host time zone, as in
 * `Mon 23 Nov, 09:00 – 09:30`. A slot and a booking start and end on one day.
 */
export function formatHostInterval(startTime: string, endTime: string): string {
  const day = formatHostDay(hostDateFormat.format(new Date(startTime)));
  return `${day}, ${formatHostTime(startTime)} – ${formatHostTime(endTime)}`;
}

/** A plain date of the contract such as `2026-11-23`, as in `Mon 23 Nov`. */
export function formatHostDay(date: string): string {
  const parts = dayFormat.formatToParts(new Date(`${date}T00:00:00Z`));
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return `${read('weekday')} ${read('day')} ${read('month')}`;
}
