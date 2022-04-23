/** @type import("..").NS */
let ns = null;

import { formatMoney, formatNumber } from 'helpers/formatters';
import { source2TargetName } from 'helpers/names';

const formatMoneySMH = (_ns, amount) => {
  return [1, 60, 60 * 60].map(mult => formatMoney(_ns, amount * mult));
};

const printIncome = ({ targetName, income, expGain, isBomb, maxRam }) => {
  ns.tprintf(
    '%-25s\t%s/sec\t%s/min\t%s/hour\texpGain: %s/s\t%s\t%s GB',
    targetName,
    ...formatMoneySMH(ns, income),
    formatNumber(ns, expGain),
    isBomb ? 'BOMB' : '',
    formatNumber(ns, maxRam)
  );
};

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();

  const flags = ns.flags([['exp', false]]);

  const [totalIncome] = ns.getScriptIncome();
  const farm = ns.getPurchasedServers();
  let portfolio = [];

  for (const sourceName of farm) {
    const targetName = source2TargetName(sourceName);
    const sourceData = ns.getServer(sourceName);

    let income = 0,
      expGain = 0,
      isBomb = false;

    if (ns.scriptRunning('singleAttack.js', sourceName)) {
      income = ns.getScriptIncome('singleAttack.js', sourceName, targetName);
      expGain = ns.getScriptExpGain('singleAttack.js', sourceName, targetName);
    } else if (ns.isRunning('multiAttack.js', sourceName, targetName)) {
      income = ns.getScriptIncome('multiAttack.js', sourceName, targetName);
      expGain = ns.getScriptExpGain('multiAttack.js', sourceName, targetName);
    } else if (ns.isRunning('multiAttack.js', sourceName, targetName, '--bomb')) {
      income = ns.getScriptIncome('multiAttack.js', sourceName, targetName, '--bomb');
      expGain = ns.getScriptExpGain('multiAttack.js', sourceName, targetName, '--bomb');
      isBomb = true;
    }

    if (income > -1) {
      portfolio.push({ ...sourceData, targetName, income, expGain, isBomb });
    }
  }

  if (flags.exp) {
    portfolio = portfolio.sort((a, b) => b.expGain - a.expGain);
  } else {
    portfolio = portfolio.sort((a, b) => b.income - a.income);
  }

  ns.tprintf('INFO Total Current Income:\t%s/sec\t%s/min\t%s/hour', ...formatMoneySMH(ns, totalIncome));

  let total = 0;
  for (const item of portfolio) {
    total += item.income;
    printIncome(item);
  }

  ns.tprintf('Total Income SingleAttack:\t%s/sec\t%s/min\t%s/hour', ...formatMoneySMH(ns, total));
}
