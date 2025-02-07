import { toZonedTime, format } from 'date-fns-tz';

export const formatAthensTime = (utcDate) => {
  const athensTime = toZonedTime(utcDate, 'Europe/Athens');
  return format(athensTime, 'EEE, dd MMM yyyy HH:mm:ss zzz', { timeZone: 'Europe/Athens' });
};