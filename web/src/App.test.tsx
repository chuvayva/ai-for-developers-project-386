import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { App } from './App.tsx';

test('renders the app heading', () => {
  render(
    <MantineProvider>
      <App />
    </MantineProvider>,
  );

  expect(screen.getByRole('heading', { name: 'Calendar' })).toBeTruthy();
});
