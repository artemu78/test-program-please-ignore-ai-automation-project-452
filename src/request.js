const timePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

export const parseRequest = (event) => {
  let data;
  try {
    const body = event.body ?? '';
    data = JSON.parse(event.isBase64Encoded ? Buffer.from(body, 'base64').toString('utf8') : body);
  } catch {
    data = null;
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) data = {};
  const errors = [];
  if (typeof data.name !== 'string' || !data.name.trim()) errors.push('name: укажите имя');
  if (typeof data.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@.]+$/.test(data.email)) errors.push('email: укажите адрес почты');
  if (typeof data.topic !== 'string' || !data.topic.trim()) errors.push('topic: укажите тему');
  const date = typeof data.time === 'string' && timePattern.test(data.time) ? new Date(data.time) : null;
  if (!date || Number.isNaN(date.getTime())) errors.push('time: укажите время в формате 2026-11-05T12:00:00+03:00');
  return { data: { ...data, name: data.name?.trim?.(), topic: data.topic?.trim?.(), email: data.email?.trim?.(), time: date }, errors };
};
