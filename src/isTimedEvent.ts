import type {Event} from '@hebcal/core/dist/esm/event';
import type {TimedEvent} from '@hebcal/core/dist/esm/TimedEvent';

/**
 * Narrows an `Event` to a `TimedEvent` by duck-typing on `eventTime`, which
 * (unlike `instanceof`) still works if multiple copies of `@hebcal/core` are
 * loaded. Not re-exported from the package index.
 */
export function isTimedEvent(ev: Event): ev is TimedEvent {
  return (ev as Partial<TimedEvent>).eventTime !== undefined;
}
