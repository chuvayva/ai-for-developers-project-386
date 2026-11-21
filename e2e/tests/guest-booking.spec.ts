import { randomUUID } from 'node:crypto';
import { type APIRequestContext, expect, type Page, test } from '@playwright/test';

// Bookings block slots across event types, and every test file shares one server.
// Each test here books on a day of its own, counted from today, that no other
// test books on, and takes one slot of the nine that day has.
const DAY_OF_THE_BOOKING_TEST = 5;
const DAY_OF_THE_CONFLICT_TEST = 7;

async function createHourCall(request: APIRequestContext, name: string): Promise<string> {
  const created = await request.post('/api/event-types', {
    data: { name, description: 'A call to book.', durationMinutes: 60 },
  });
  expect(created.status()).toBe(201);
  const eventType: { id: string } = await created.json();
  return eventType.id;
}

/** Opens the booking page of the event type on a day of the booking window. */
async function openDay(page: Page, eventTypeId: string, daysFromToday: number) {
  await page.goto(`/book/${eventTypeId}`);
  const day = page.getByRole('list', { name: 'Days' }).getByRole('button').nth(daysFromToday);
  await day.click();
  await expect(day).toHaveAttribute('aria-pressed', 'true');
}

test('a guest books a slot, sees the confirmation and the slot is gone', async ({
  page,
  request,
}) => {
  const name = `Booking call ${randomUUID()}`;
  const eventTypeId = await createHourCall(request, name);
  await openDay(page, eventTypeId, DAY_OF_THE_BOOKING_TEST);

  const slots = page.getByRole('list', { name: 'Slots' }).getByRole('listitem');
  // The first slot that is free. A retry of this test finds its earlier one taken.
  const time = await slots.first().innerText();
  expect(time).toMatch(/^(09|1[0-7]):00 – (1[0-8]):00$/);
  await slots.first().getByRole('button').click();

  await page.getByLabel('Your name').fill('Anna Petrova');
  await page.getByLabel('Your email').fill('anna@example.com');
  await page.getByRole('button', { name: 'Book' }).click();

  const confirmation = page.getByRole('region', { name: 'Booking confirmed' });
  await expect(confirmation).toBeVisible();
  await expect(confirmation).toContainText(name);
  await expect(confirmation).toContainText(time);
  await expect(confirmation).toContainText('Europe/Moscow');
  await expect(confirmation).toContainText('Anna Petrova');
  await expect(confirmation).toContainText('anna@example.com');

  await page.getByRole('button', { name: 'Book another time' }).click();
  await expect(slots.first()).toBeVisible();
  await expect(slots.filter({ hasText: time })).toHaveCount(0);

  // The server keeps the booking, so the slot is still gone after a reload.
  await openDay(page, eventTypeId, DAY_OF_THE_BOOKING_TEST);
  await expect(slots.first()).toBeVisible();
  await expect(slots.filter({ hasText: time })).toHaveCount(0);
});

test('a guest whose slot was booked meanwhile sees the conflict and a fresh slot list', async ({
  page,
  request,
}) => {
  const eventTypeId = await createHourCall(request, `Conflict call ${randomUUID()}`);
  await openDay(page, eventTypeId, DAY_OF_THE_CONFLICT_TEST);

  const slots = page.getByRole('list', { name: 'Slots' }).getByRole('listitem');
  const time = await slots.first().innerText();
  await slots.first().getByRole('button').click();
  await page.getByLabel('Your name').fill('Anna Petrova');
  await page.getByLabel('Your email').fill('anna@example.com');

  // Another guest books the same slot while this one fills in the form.
  const listed = await request.get(`/api/event-types/${eventTypeId}/slots`);
  const days: { slots: { startTime: string }[] }[] = await listed.json();
  const startTime = days[DAY_OF_THE_CONFLICT_TEST]?.slots[0]?.startTime;
  const booked = await request.post('/api/bookings', {
    data: { eventTypeId, startTime, guestName: 'Boris', guestEmail: 'boris@example.com' },
  });
  expect(booked.status()).toBe(201);

  await page.getByRole('button', { name: 'Book' }).click();

  await expect(page.getByRole('alert')).toHaveText(
    'Someone else has just booked this time. Choose another one.',
  );
  await expect(page.getByRole('region', { name: 'Booking confirmed' })).toHaveCount(0);
  await expect(slots.first()).toBeVisible();
  await expect(slots.filter({ hasText: time })).toHaveCount(0);
});
