export const selectConsultant = (consultants, topic, random = Math.random) => {
  const matching = consultants.filter((person) => person.topics.includes(topic));
  return matching[Math.floor(random() * matching.length)] ?? null;
};

export const checkTime = (start, now) => {
  if (start <= now) return 'time: время должно быть в будущем';
  const moscow = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const day = moscow.getUTCDay();
  const minutes = moscow.getUTCHours() * 60 + moscow.getUTCMinutes();
  if (day === 0 || day === 6 || minutes < 600 || minutes > 1080 || (minutes === 1080 && (moscow.getUTCSeconds() || moscow.getUTCMilliseconds()))) return 'time: выберите будний день с 10:00 до 18:00 по Москве';
  return null;
};

export const getEnd = (start) => new Date(start.getTime() + 60 * 60 * 1000);
