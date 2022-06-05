import { format, isToday, isYesterday, isSameYear } from "date-fns";

const timeFormat = 'HH:mm:ss';
const dateFormat = 'd MMM';
const yearFormat = 'yyyy';

export const formatTime = (time: Date) => {
  if (isToday(time)) {
    return format(time, timeFormat);
  } else if (isYesterday(time)) {
    return `Yesterday, ${format(time, timeFormat)}`;
  } else if (isSameYear(time, Date.now())) {
    return format(time, `${dateFormat}, ${timeFormat}`);
  } else {
    return format(time, `${dateFormat} ${yearFormat}, ${timeFormat}`);
  }
};
