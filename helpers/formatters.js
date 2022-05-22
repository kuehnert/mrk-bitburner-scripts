import { HOUR, MINUTE, SECOND, THOUSAND, MILLION } from 'helpers/globals';

/**
 * Formats the current time of the system in the format 21:35:00
 * @param {*} ns
 * @returns system time as string
 */
export const formatTime = ns => {
  const time = new Date();

  return ns.sprintf('%d:%02d:%02d', time.getHours(), time.getMinutes(), time.getSeconds());
};

export const formatDuration = (ns, durationMs, showMS = false) => {
  const hours = Math.floor(durationMs / HOUR);
  durationMs %= HOUR;
  const minutes = Math.floor(durationMs / MINUTE);
  durationMs %= MINUTE;
  let seconds = Math.floor(durationMs / SECOND);

  if (showMS) {
    return ns.sprintf('%d:%02d:%02d.%03d', hours, minutes, seconds, durationMs % 1000);
  } else {
    return ns.sprintf('%d:%02d:%02d', hours, minutes, seconds);
  }
};

export const formatMoney = (_ns, money, { markAffordable } = {}) => {
  if (markAffordable && money <= _ns.getServerMoneyAvailable('home')) {
    return '<span class="success">$' + formatNumber(_ns, money) + '</span>';
  } else {
    return '$' + formatNumber(_ns, money);
  }
};

const prefixes = [' ', 'k', 'm', 'b', 't', 'q'];

const _fn = (ns, number) => ns.sprintf('%7.3f', number);

export const formatNumber = (ns, number) => {
  if (number === 0) {
    return '      - ';
  }

  for (let i = 0; i < prefixes.length; i++) {
    if (Math.abs(number) < 1000) {
      return _fn(ns, number) + prefixes[i];
    } else {
      number /= 1000;
    }
  }

  return _fn(ns, number) + prefixes[prefixes.length - 1];
};

export const formatPercent = (ns, percent) => ns.sprintf('%5.1f%%', percent * 100);

export const amountFromString = str => {
  const lastChar = str.slice(-1);
  const rest = str.slice(0, -1);

  if (lastChar === 'm') {
    return +rest * MILLION;
  } else if (lastChar === 'k') {
    return +rest * THOUSAND;
  } else {
    return +str;
  }
};

export const formatCmd = (text, cmd, { onlyIf = true }) => {
  if (onlyIf) {
    return `[${text}]!${cmd}!`;
  } else {
    return text;
  }
};
