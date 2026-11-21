import { Anchor, Container, Paper, Stack, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { type EventType, listEventTypes } from '../api/client.ts';

type Loading = 'loading' | 'loaded' | 'failed';

function EventTypeChoice({ eventTypes }: { eventTypes: EventType[] }) {
  if (eventTypes.length === 0) {
    return <Text c="dimmed">There are no event types to book yet.</Text>;
  }

  return (
    <Stack component="ul" aria-label="Event types" p={0} m={0} style={{ listStyle: 'none' }}>
      {eventTypes.map((eventType) => (
        <Paper component="li" key={eventType.id} withBorder p="md">
          <Title order={2} size="h4">
            <Anchor component={Link} to={`/book/${encodeURIComponent(eventType.id)}`} inherit>
              {eventType.name}
            </Anchor>
          </Title>
          <Text size="sm" c="dimmed">
            {eventType.durationMinutes} min
          </Text>
          {eventType.description && <Text mt="xs">{eventType.description}</Text>}
        </Paper>
      ))}
    </Stack>
  );
}

/** Where a guest chooses the kind of call to book. */
export function GuestEventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState<Loading>('loading');

  useEffect(() => {
    let current = true;

    listEventTypes().then(
      (loaded) => {
        if (current) {
          setEventTypes(loaded);
          setLoading('loaded');
        }
      },
      () => {
        if (current) {
          setLoading('failed');
        }
      },
    );

    return () => {
      current = false;
    };
  }, []);

  return (
    <Container size="sm" py="xl">
      <Title order={1}>Book a call</Title>
      <Text c="dimmed" mt="sm">
        Choose the kind of call you want.
      </Text>

      <Stack mt="lg">
        {loading === 'loading' && <Text c="dimmed">Loading the event types.</Text>}
        {loading === 'failed' && <Text c="red">The event types could not be loaded.</Text>}
        {loading === 'loaded' && <EventTypeChoice eventTypes={eventTypes} />}
      </Stack>

      <Anchor component={Link} to="/" mt="xl" display="inline-block">
        Back to home
      </Anchor>
    </Container>
  );
}
