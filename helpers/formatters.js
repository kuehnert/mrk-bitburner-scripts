export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;

export const formatTime = ns => {
  const time = new Date();

  return ns.sprintf('%d:%02d:%02d', time.getHours(), time.getMinutes(), time.getSeconds());
};

export const formatDuration = (ns, durationMs) => {
  const hours = Math.floor(durationMs / HOUR);
  durationMs %= HOUR;
  const minutes = Math.floor(durationMs / MINUTE);
  durationMs %= MINUTE;
  let seconds = Math.floor(durationMs / SECOND);

  return ns.sprintf('%d:%02d:%02d', hours, minutes, seconds);
};

export const formatMoney = (ns, money) => {
  return '$' + formatNumber(ns, money);
};

const prefixes = [' ', 'k', 'm', 'b', 't', 'q'];

const _fn = (ns, number) => ns.sprintf('%7.3f', number);

export const formatNumber = (ns, number) => {
  for (let i = 0; i < prefixes.length; i++) {
    if (Math.abs(number) < 1000) {
      return _fn(ns, number) + prefixes[i];
    } else {
      number /= 1000;
    }
  }

  return _fn(ns, number) + prefixes[prefixes.length - 1];
};