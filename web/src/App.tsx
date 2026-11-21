import { Container, Text, Title } from '@mantine/core';

export function App() {
  return (
    <Container size="sm" py="xl">
      <Title order={1}>Calendar</Title>
      <Text c="dimmed" mt="sm">
        Book a call in a free time slot.
      </Text>
    </Container>
  );
}
