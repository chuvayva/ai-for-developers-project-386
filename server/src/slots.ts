import type { components } from '@calendar/api';

type Slot = components['schemas']['Slot'];
type SlotDay = components['schemas']['SlotDay'];

/** The zone in which calendar days and working hours are measured. */
const HOST_TIME_ZONE = 'Europe/Moscow';

const BOOKING_WINDOW_DAYS = 14;

// Working hours, in minutes from midnight in the host time zone.
const WORKING_HOURS_START = 9 * 60;
const WORKING_HOURS_END = 18 * 60;

const MINUTE = 60_000;

/** The interval of a booking. Any offset is read as the moment it names. */
export type BookedInterval = { startTime: string; endTime: string };

export type SlotQuestion = {
  /** The duration of the event type whose slots are asked for. */
  durationMinutes: number;
  /** The current moment. */
  now: Date;
  /** The bookings of every event type. Ones outside the booking window are harmless. */
  bookings: readonly BookedInterval[];
};

const hostClock = new Intl.DateTimeFormat('en-US', {
  timeZone: HOST_TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
});

// A "wall time" below is what a clock in the host time zone shows, written as
// the UTC timestamp with the same digits. It keeps the arithmetic of days and
// hours away from the zone of the server process.

function toWallTime(moment: number): number {
  const parts = hostClock.formatToParts(moment);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return Date.UTC(
    read('year'),
    read('month') - 1,
    read('day'),
    read('hour'),
    read('minute'),
    read('second'),
  );
}

/** How far the host clock is ahead of UTC at a moment. */
function offsetAt(moment: number): number {
  return toWallTime(moment) - moment;
}

function fromWallTime(wallTime: number): number {
  // The offset is looked up twice so that the answer is right next to a change of offset.
  return wallTime - offsetAt(wallTime - offsetAt(wallTime));
}

/**
 * A moment the way the contract writes it: UTC with `Z` and whole seconds. A
 * fraction of a second is dropped.
 */
export function toTimestamp(moment: number): string {
  return `${new Date(moment).toISOString().slice(0, 19)}Z`;
}

/**
 * The slots of an event type for the whole booking window: 14 days in order,
 * starting with today in the host time zone, each with its slots earliest
 * first. A day with no slot has an empty list.
 *
 * This is the one place that applies the five slot rules of the contract.
 */
export function listSlotDays(question: SlotQuestion): SlotDay[] {
  const { durationMinutes } = question;
  const now = question.now.getTime();
  const booked = question.bookings.map((booking) => ({
    start: Date.parse(booking.startTime),
    end: Date.parse(booking.endTime),
  }));

  const today = new Date(toWallTime(now));
  const days: SlotDay[] = [];

  // Rule 1: the booking window is today and the 13 days after it.
  for (let offset = 0; offset < BOOKING_WINDOW_DAYS; offset += 1) {
    const midnight = Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() + offset,
    );
    const slots: Slot[] = [];

    // Rule 2: starts are counted from 09:00 in steps of the duration.
    // Rule 3: the slot ends by 18:00.
    for (
      let minutes = WORKING_HOURS_START;
      minutes + durationMinutes <= WORKING_HOURS_END;
      minutes += durationMinutes
    ) {
      const start = fromWallTime(midnight + minutes * MINUTE);
      const end = start + durationMinutes * MINUTE;

      // Rule 4: the slot starts in the future.
      const isFuture = start > now;
      // Rule 5: an interval includes its start and excludes its end.
      const isFree = booked.every((booking) => booking.end <= start || end <= booking.start);

      if (isFuture && isFree) {
        slots.push({ startTime: toTimestamp(start), endTime: toTimestamp(end) });
      }
    }

    days.push({ date: new Date(midnight).toISOString().slice(0, 10), slots });
  }

  return days;
}

/** What a start time is for an event type at this moment. */
export type StartTimeAnswer =
  /** A slot: `listSlotDays` offers it. */
  | { is: 'slot'; slot: Slot }
  /** It passes every slot rule but the overlap: a booking covers part of its interval. */
  | { is: 'taken' }
  /** It breaks a slot rule other than the overlap. */
  | { is: 'not-a-slot' };

/**
 * Says whether a start time can be booked. It asks `listSlotDays`, so the
 * answer is `slot` exactly for the start times that function offers.
 */
export function checkStartTime(question: SlotQuestion, startTime: Date): StartTimeAnswer {
  const start = startTime.getTime();
  const find = (bookings: readonly BookedInterval[]) =>
    listSlotDays({ ...question, bookings })
      .flatMap((day) => day.slots)
      .find((slot) => Date.parse(slot.startTime) === start);

  // With no bookings only the overlap rule is left out.
  if (!find([])) {
    return { is: 'not-a-slot' };
  }
  const slot = find(question.bookings);
  return slot ? { is: 'slot', slot } : { is: 'taken' };
}
