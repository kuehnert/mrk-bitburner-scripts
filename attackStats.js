/** @type import(".").NS */
let ns = null;

import { formatMoney } from 'helpers/formatters';

const printIncome = ({ target, income }) =>
  ns.tprintf('%-17s: %s/s', target, formatMoney(ns, income));

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();

  const [totalIncome] = ns.getScriptIncome();
  const farm = ns.getPurchasedServers();
  let portfolio = [];

  for (const server of farm) {
    const target = server.substring(6).toLowerCase();
    const income = ns.getScriptIncome('singleAttack.js', server, target);
    if (income > -1) {
      portfolio.push({ target, income });
    }
  }

  portfolio = portfolio.sort((a, b) => b.income - a.income);

  ns.tprintf('INFO Total Current Income per Second: %s/s', formatMoney(ns, totalIncome));
  let total = 0;
  for (const item of portfolio) {
    total += item.income;
    printIncome(item);
  }

  ns.tprintf('Total Income from SingleAttack: %s/s', formatMoney(ns, total));
}
