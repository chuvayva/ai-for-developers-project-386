import { Anchor, Container, Text, Title } from '@mantine/core';
import { Link } from 'react-router';

export function BookingPage() {
  return (
    <Container size="sm" py="xl">
      <Title order={1}>Book a call</Title>
      <Text c="dimmed" mt="sm">
        Booking is coming soon.
      </Text>
      <Anchor component={Link} to="/" mt="lg" display="inline-block">
        Back to home
      </Anchor>
    </Container>
  );
}
