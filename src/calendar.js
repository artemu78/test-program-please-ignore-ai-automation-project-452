import { randomUUID } from 'node:crypto';

const escapeText = (value) => String(value).replaceAll('\\', '\\\\').replaceAll('\n', '\\n').replaceAll(',', '\\,').replaceAll(';', '\\;').replaceAll('\r', '');
const escapeParam = (value) => String(value).replace(/[\r\n";:,]/g, ' ');
const stamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export const createEvent = ({ name, email, topic, consultant, start, end, user, uid, now = new Date() }) => [
  'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Hexlet//Booking//RU', 'BEGIN:VEVENT',
  `UID:${uid}`, `DTSTAMP:${stamp(now)}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
  `SUMMARY:${escapeText(`Консультация: ${name}`)}`,
  `DESCRIPTION:${escapeText(`Тема: ${topic}. Консультант: ${consultant.name}. Почта клиента: ${email}`)}`,
  `ORGANIZER:mailto:${user}`, `ATTENDEE;CN="${escapeParam(consultant.name)}":mailto:${consultant.email}`,
  `ATTENDEE;CN="${escapeParam(name)}":mailto:${email}`, 'END:VEVENT', 'END:VCALENDAR', '',
].join('\r\n');

export const saveEvent = async (booking, { url, user, password }, fetcher = fetch) => {
  const uid = randomUUID();
  const target = new URL(`${uid}.ics`, url.endsWith('/') ? url : `${url}/`);
  const response = await fetcher(target, {
    method: 'PUT',
    headers: {
      Authorization: `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`,
      'Content-Type': 'text/calendar; charset=utf-8',
      'If-None-Match': '*',
    },
    body: createEvent({ ...booking, user, uid }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`CalDAV returned ${response.status}`);
};
