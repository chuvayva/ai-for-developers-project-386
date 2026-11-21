import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, test } from 'vitest';
import { App } from './App.tsx';

function renderAt(path: string) {
  render(
    <MantineProvider>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </MantineProvider>,
  );
}

test('home page links to the booking page', () => {
  renderAt('/');

  expect(screen.getByRole('heading', { name: 'Calendar' })).toBeTruthy();
  const link = screen.getByRole('link', { name: 'Book a call' });
  expect(link.getAttribute('href')).toBe('/book');
});

test('following the home page link opens the booking page', () => {
  renderAt('/');

  fireEvent.click(screen.getByRole('link', { name: 'Book a call' }));

  expect(screen.getByRole('heading', { name: 'Book a call' })).toBeTruthy();
  expect(screen.getByText('Booking is coming soon.')).toBeTruthy();
});

test('unknown path shows the not found page', () => {
  renderAt('/no-such-page');

  expect(screen.getByRole('heading', { name: 'Page not found' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Back to home' }).getAttribute('href')).toBe('/');
});
