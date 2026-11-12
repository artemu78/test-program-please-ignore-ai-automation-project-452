import { test, expect } from 'vitest';
import { selectConsultant, checkTime, getEnd } from '../src/booking.js';
import { parseRequest } from '../src/request.js';
import { createEvent } from '../src/calendar.js';

const people = [{ name: 'A', topics: ['frontend'] }, { name: 'B', topics: ['frontend'] }];
test('selects among matching consultants', () => {
  expect(selectConsultant(people, 'frontend', () => 0).name).toBe('A');
  expect(selectConsultant(people, 'frontend', () => 0.99).name).toBe('B');
  expect(selectConsultant(people, 'backend')).toBeNull();
});
test('checks Moscow hours and elapsed time', () => {
  const now = new Date('2026-11-02T00:00:00Z');
  for (const hour of ['10:00', '18:00']) expect(checkTime(new Date(`2026-11-03T${hour}:00+03:00`), now)).toBeNull();
  for (const time of ['2026-11-03T09:59:00+03:00', '2026-11-03T18:30:00+03:00', '2026-11-07T12:00:00+03:00']) expect(checkTime(new Date(time), now)).not.toBeNull();
  expect(checkTime(new Date('2026-11-01T12:00:00+03:00'), now)).not.toBeNull();
  expect(getEnd(new Date('2026-11-03T10:00:00+03:00')).toISOString()).toBe('2026-11-03T08:00:00.000Z');
});
test('parses request and rejects missing fields or timezone', () => {
  expect(parseRequest({ body: '' }).errors).toHaveLength(4);
  const body = JSON.stringify({ name: 'Мария', email: 'maria@example.com', topic: 'frontend', time: '2026-11-03T12:00:00+03:00' });
  expect(parseRequest({ body: Buffer.from(body).toString('base64'), isBase64Encoded: true }).errors).toEqual([]);
  expect(parseRequest({ body: body.replace('+03:00', '') }).errors[0]).toContain('time');
});
test('creates UTC calendar event with attendees', () => {
  const start = new Date('2026-11-03T12:00:00+03:00');
  const event = createEvent({ name: 'Мария', email: 'maria@example.com', topic: 'frontend', consultant: { name: 'Анна', email: 'anna@example.com' }, start, end: getEnd(start), user: 'school@yandex.ru', uid: 'id', now: start });
  expect(event).toContain('DTSTART:20261103T090000Z');
  expect(event).toContain('ORGANIZER:mailto:school@yandex.ru');
  expect(event).toContain('mailto:maria@example.com');
  expect(event).toContain('mailto:anna@example.com');
});
