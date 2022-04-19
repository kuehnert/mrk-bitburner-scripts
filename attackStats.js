/** @type import(".").NS */
let ns = null;

import { formatMoney } from 'helpers/formatters';
import { source2TargetName } from 'deployAttack';

const formatMoneySMH = (_ns, amount) => {
  return [1, 60, 60 * 60].map(mult => formatMoney(_ns, amount * mult));
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
    let income;
    if (ns.scriptRunning('singleAttack.js', server)) {
      income = ns.getScriptIncome('singleAttack.js', server, target);
    } else {
      income = ns.getScriptIncome('multiAttack.js', server, target);
    }

    if (income > -1) {
      portfolio.push({ target, income });
    }
  }

  portfolio = portfolio.sort((a, b) => b.income - a.income);
  ns.printf('portfolio: %s', JSON.stringify(portfolio, null, 4));

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
