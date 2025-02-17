import { msValues } from "./msValues";

export const formatMs = (ms: number) => {
  const years = Math.floor(ms / msValues.year);
  const months = Math.floor((ms % msValues.year) / msValues.month);
  const days = Math.floor((ms % msValues.month) / msValues.day);
  const hours = Math.floor((ms % msValues.day) / msValues.hour);
  const minutes = Math.floor((ms % msValues.hour) / msValues.minute);
  const seconds = Math.floor((ms % msValues.minute) / msValues.second);
  return { years, months, days, hours, minutes, seconds };
};
