import { randomUUID } from 'node:crypto';
import type { components } from '@calendar/api';

type EventType = components['schemas']['EventType'];

export type NewEventType = Omit<EventType, 'id'>;

/**
 * Everything the server remembers. It lives in memory, so it starts empty and
 * is lost when the process stops.
 */
export type Store = {
  createEventType(input: NewEventType): EventType;
  /** In order of creation, oldest first. */
  listEventTypes(): EventType[];
};

export function createStore(): Store {
  // A Map iterates in insertion order, which is the order of creation.
  const eventTypes = new Map<string, EventType>();

  return {
    createEventType(input) {
      const eventType: EventType = { id: `evt_${randomUUID()}`, ...input };
      eventTypes.set(eventType.id, eventType);
      return eventType;
    },
    listEventTypes() {
      return [...eventTypes.values()];
    },
  };
}
