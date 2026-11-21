import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';

// Bookings block slots across event types, and every test file shares one server.
// This test books on a day of its own, counted from today, that no other test
// books on, and takes one slot of the nine that day has.
const DAY_OF_THE_BOOKING = 9;

test('a guest books a slot and the host sees it among the upcoming bookings', async ({
  page,
  request,
}) => {
  const id = randomUUID();
  const eventTypeName = `Listed call ${id}`;
  // The other tests' bookings are listed too, so this one is found by its guest.
  const guestName = `Guest ${id}`;
  const created = await request.post('/api/event-types', {
    data: { name: eventTypeName, description: 'A call to book.', durationMinutes: 60 },
  });
  expect(created.status()).toBe(201);
  const eventType: { id: string } = await created.json();

  await page.goto(`/book/${eventType.id}`);
  const day = page.getByRole('list', { name: 'Days' }).getByRole('button').nth(DAY_OF_THE_BOOKING);
  await day.click();
  await expect(day).toHaveAttribute('aria-pressed', 'true');

  const slots = page.getByRole('list', { name: 'Slots' }).getByRole('listitem');
  // The first slot that is free. A retry of this test finds its earlier one taken.
  const time = await slots.first().innerText();
  expect(time).toMatch(/^(09|1[0-7]):00 – (1[0-8]):00$/);
  await slots.first().getByRole('button').click();
  await page.getByLabel('Your name').fill(guestName);
  await page.getByLabel('Your email').fill('anna@example.com');
  await page.getByRole('button', { name: 'Book' }).click();
  await expect(page.getByRole('region', { name: 'Booking confirmed' })).toBeVisible();

  await page.goto('/');
  await page.getByRole('link', { name: 'Upcoming bookings' }).click();

  await expect(page.getByRole('heading', { name: 'Upcoming bookings' })).toBeVisible();
  await expect(page.getByText('Europe/Moscow')).toBeVisible();
  const booking = page
    .getByRole('list', { name: 'Upcoming bookings' })
    .getByRole('listitem')
    .filter({ hasText: guestName });
  await expect(booking).toHaveCount(1);
  await expect(booking).toContainText(eventTypeName);
  await expect(booking).toContainText(time);
  await expect(booking).toContainText('anna@example.com');
});
