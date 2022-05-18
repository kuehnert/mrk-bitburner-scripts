/** @type import("..").NS */
let ns = null;

import { simulatePrimedServer } from './helpers/ramCalculations';
import { formatMoney } from './helpers/formatters';
import { calcAttackTimes, calcTotalRamCost } from './helpers/ramCalculations';

export async function main(_ns) {
  ns = _ns;
  ns.disableLog('ALL')
  ns.disableLog('getServerMinSecurityLevel')
  ns.tail();

  // const server = ns.getServer('joesguns');
  // const threads = 485;
  // server.moneyAvailable = 31323024;
  // server.hackDifficulty = 10.5;

  // let growPercent = ns.formulas.hacking.growPercent(server, 1, ns.getPlayer(), 3);
  // ns.tprintf('growPercent 1 thread: %f', growPercent);
  // let money = server.moneyAvailable;
  // for (let i = 0; i < threads; i++) {
  //   money = growPercent * money;
  // }
  // ns.tprintf('1 threads: money: %s/%s', formatMoney(ns, money), formatMoney(ns, server.moneyMax));

  // growPercent = ns.formulas.hacking.growPercent(server, threads, ns.getPlayer(), 3);
  // ns.tprintf('%d threads: growPercent: %f', threads, growPercent);
  // ns.tprintf(
  //   '%d threads: money: %s/%s',
  //   threads,
  //   formatMoney(ns, growPercent * server.moneyAvailable),
  //   formatMoney(ns, server.moneyMax)
  // );

  // const myJoe05 = simulatePrimedServer(ns, 'joesguns', 0.5);
  // ns.tprintf('myJoe: %s', JSON.stringify(myJoe05, null, 4));

  // const myJoe10 = simulatePrimedServer(ns, 'joesguns', 1);
  // ns.tprintf('myJoe: %s', JSON.stringify(myJoe10, null, 4));

  const threads = calcTotalRamCost(ns, 'iron-gym', 'joesguns');
  const times = calcAttackTimes(ns, 'iron-gym', threads);
  ns.printf('times: %s', JSON.stringify(times, null, 4));
}
