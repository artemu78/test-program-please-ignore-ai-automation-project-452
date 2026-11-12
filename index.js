import { readFileSync } from 'node:fs';
import { parseRequest } from './src/request.js';
import { selectConsultant, checkTime, getEnd } from './src/booking.js';
import { saveEvent } from './src/calendar.js';

const consultants = JSON.parse(readFileSync(new URL('./consultants.json', import.meta.url), 'utf8'));
const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
const reply = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return reply(405, { errors: ['method: используйте POST'] });
  const { data, errors } = parseRequest(event);
  if (errors.length) return reply(400, { errors });
  const consultant = selectConsultant(consultants, data.topic);
  if (!consultant) return reply(422, { errors: ['topic: нет консультанта по этой теме'] });
  const timeError = checkTime(data.time, new Date());
  if (timeError) return reply(422, { errors: [timeError] });
  const start = data.time;
  const end = getEnd(start);
  const { CALDAV_URL: url, CALDAV_USER: user, CALDAV_PASSWORD: password } = process.env;
  if (!url || !user || !password) {
    console.error('CalDAV configuration is incomplete');
    return reply(502, { errors: ['Не удалось создать запись в календаре'] });
  }
  try {
    await saveEvent({ ...data, consultant, start, end }, { url, user, password });
  } catch (error) {
    console.error('CalDAV request failed:', error);
    return reply(502, { errors: ['Не удалось создать запись в календаре'] });
  }
  return reply(201, { consultant: consultant.name, start: start.toISOString(), end: end.toISOString() });
};
