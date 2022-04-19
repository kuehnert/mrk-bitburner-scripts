/** @type import(".").NS */
let ns = null;

import { formatMoney } from 'helpers/formatters';
import { source2TargetName } from 'deploySingleAttack';

const formatMoneySMH = (ns, amount) => {
  return [1, 60, 60 * 60].map(mult => formatMoney(ns, amount * mult));
};

const printIncome = ({ target, income }) => {
  ns.tprintf('%-25s\t%s/sec\t%s/min\t%s/hour', target, ...formatMoneySMH(ns, income));
};

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();

  const [totalIncome] = ns.getScriptIncome();
  const farm = ns.getPurchasedServers();
  let portfolio = [];

  for (const server of farm) {
    const target = source2TargetName(server);
    const income = ns.getScriptIncome('singleAttack.js', server, target);
    if (income > -1) {
      portfolio.push({ target, income });
    }
  }

  portfolio = portfolio.sort((a, b) => b.income - a.income);

  ns.tprintf(
    'INFO Total Current Income:\t%s/sec\t%s/min\t%s/hour',
    ...formatMoneySMH(ns, totalIncome)
  );
  let total = 0;
  for (const item of portfolio) {
    total += item.income;
    printIncome(item);
  }

  ns.tprintf('Total Income SingleAttack:\t%s/sec\t%s/min\t%s/hour', ...formatMoneySMH(ns, total));
}
