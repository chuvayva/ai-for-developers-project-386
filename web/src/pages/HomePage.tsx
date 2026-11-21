import { Button, Container, Text, Title } from '@mantine/core';
import { Link } from 'react-router';

export function HomePage() {
  return (
    <Container size="sm" py="xl">
      <Title order={1}>Calendar</Title>
      <Text c="dimmed" mt="sm">
        Book a call in a free time slot.
      </Text>
      <Button component={Link} to="/book" mt="lg">
        Book a call
      </Button>
    </Container>
  );
}
