import { Anchor, Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import {
  ApiRequestError,
  type EventType,
  getEventType,
  listSlots,
  type SlotDay,
} from '../api/client.ts';
import { failureText } from '../api/failureText.ts';
import { formatHostDay, formatHostTime, HOST_TIME_ZONE } from '../hostTime.ts';

type Loaded =
  | { state: 'loaded'; eventType: EventType; days: SlotDay[] }
  | { state: 'not-found' }
  | { state: 'failed'; text: string };

function slotCount(day: SlotDay): string {
  if (day.slots.length === 0) {
    return 'No slots';
  }
  return day.slots.length === 1 ? '1 slot' : `${day.slots.length} slots`;
}

function DayPicker(props: { days: SlotDay[]; chosen: string; onChoose: (date: string) => void }) {
  return (
    <Group component="ul" aria-label="Days" gap="xs" p={0} m={0} style={{ listStyle: 'none' }}>
      {props.days.map((day) => (
        <li key={day.date}>
          <Button
            variant={day.date === props.chosen ? 'filled' : 'default'}
            aria-pressed={day.date === props.chosen}
            onClick={() => props.onChoose(day.date)}
            h="auto"
            py="xs"
          >
            <Stack gap={0} align="center">
              <span>{formatHostDay(day.date)}</span>
              <Text span size="xs" opacity={day.slots.length === 0 ? 0.6 : 1}>
                {slotCount(day)}
              </Text>
            </Stack>
          </Button>
        </li>
      ))}
    </Group>
  );
}

function SlotList({ day }: { day: SlotDay }) {
  if (day.slots.length === 0) {
    return <Text c="dimmed">There are no slots on this day.</Text>;
  }

  return (
    <Group component="ul" aria-label="Slots" gap="xs" p={0} m={0} style={{ listStyle: 'none' }}>
      {day.slots.map((slot) => (
        <Text component="li" key={slot.startTime} px="sm" py={4} bd="1px solid gray.4" bdrs="sm">
          {formatHostTime(slot.startTime)} – {formatHostTime(slot.endTime)}
        </Text>
      ))}
    </Group>
  );
}

function SlotPicker({ eventType, days }: { eventType: EventType; days: SlotDay[] }) {
  // No choice yet means the first day of the booking window, which is today.
  const [chosenDate, setChosenDate] = useState<string>();
  const chosen = days.find((day) => day.date === chosenDate) ?? days[0];

  return (
    <>
      <Title order={1}>{eventType.name}</Title>
      <Text size="sm" c="dimmed">
        {eventType.durationMinutes} min
      </Text>
      {eventType.description && <Text mt="xs">{eventType.description}</Text>}

      <Title order={2} size="h4" mt="xl" mb="sm">
        Choose a day
      </Title>
      <DayPicker days={days} chosen={chosen?.date ?? ''} onChoose={setChosenDate} />

      {chosen && (
        <>
          <Title order={2} size="h4" mt="xl">
            {formatHostDay(chosen.date)}
          </Title>
          <Text size="sm" c="dimmed" mb="sm">
            Times are in the host time zone, {HOST_TIME_ZONE}.
          </Text>
          <SlotList day={chosen} />
        </>
      )}
    </>
  );
}

/** Where a guest sees the slots of one event type. */
export function BookingPage() {
  const { eventTypeId = '' } = useParams();
  // The answer is kept with the id it is for, so the answer for another id reads as loading.
  const [answer, setAnswer] = useState<{ eventTypeId: string; loaded: Loaded }>();
  const loaded = answer?.eventTypeId === eventTypeId ? answer.loaded : undefined;

  useEffect(() => {
    let current = true;
    const setLoaded = (next: Loaded) => {
      if (current) {
        setAnswer({ eventTypeId, loaded: next });
      }
    };

    Promise.all([getEventType(eventTypeId), listSlots(eventTypeId)]).then(
      ([eventType, days]) => setLoaded({ state: 'loaded', eventType, days }),
      (error: unknown) => {
        const isNotFound =
          error instanceof ApiRequestError && error.code === 'event_type_not_found';
        setLoaded(
          isNotFound ? { state: 'not-found' } : { state: 'failed', text: failureText(error) },
        );
      },
    );

    return () => {
      current = false;
    };
  }, [eventTypeId]);

  return (
    <Container size="sm" py="xl">
      {!loaded && <Text c="dimmed">Loading the slots.</Text>}
      {loaded?.state === 'failed' && <Text c="red">{loaded.text}</Text>}
      {loaded?.state === 'not-found' && (
        <>
          <Title order={1}>Event type not found</Title>
          <Text c="dimmed" mt="sm">
            This event type does not exist.
          </Text>
        </>
      )}
      {loaded?.state === 'loaded' && (
        // A key of its own, so another event type starts with no chosen day.
        <SlotPicker key={loaded.eventType.id} eventType={loaded.eventType} days={loaded.days} />
      )}

      <Anchor component={Link} to="/book" mt="xl" display="block">
        See the event types
      </Anchor>
    </Container>
  );
}
