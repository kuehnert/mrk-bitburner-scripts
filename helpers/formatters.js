export const formatTime = ns => {
  const time = new Date();

  return ns.sprintf(
    '%d:%02d:%02d',
    time.getHours(),
    time.getMinutes(),
    time.getSeconds()
  );
};

export const formatMoney = money => {
  return '$' + formatNumber(money);
};

const prefixes = ['', 'k', 'm', 'b', 't', 'q'];

export const formatNumber = number => {
  for (let i = 0; i < prefixes.length; i++) {
    if (Math.abs(number) < 1000) {
      return `${Math.floor(number * 1000) / 1000}${prefixes[i]}`;
    } else {
      number /= 1000;
    }
  }
  return `${Math.floor(number * 1000) / 1000}${prefixes[prefixes.length - 1]}`;
};
