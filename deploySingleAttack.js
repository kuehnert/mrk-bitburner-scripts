/** @type import(".").NS */
let ns = null;

import { formatMoney, formatNumber, formatDuration } from 'helpers/formatters';
import { calcTotalRamCost } from 'helpers/ramCalculations';

export const autocomplete = data => [...data.servers];

const DEPENDENCIES = [
  'singleAttack.js',
  'minigrow.js',
  'minihack.js',
  'miniweaken.js',
  'primeServer.js',
  '/helpers/formatters.js',
  '/helpers/fakeFormulas.js',
  '/helpers/logServerInfo.js',
];

const purchaseServer = (sourceName, targetName) => {
  const ownedCount = ns.getPurchasedServers().length;
  const ownedLimit = ns.getPurchasedServerLimit();
  if (ownedCount >= ownedLimit) {
    ns.tprintf(
      'ERROR You already own a maximum %d out of %d servers. Exiting',
      ownedCount,
      ownedLimit
    );
    ns.exit();
  }

  ns.tprintf('Determining hacking memory requirements...');
  const { serverSizeRequired } = calcTotalRamCost(ns, targetName);
  const cost = ns.getPurchasedServerCost(serverSizeRequired);
  ns.tprintf('We need a server with %d GB. Cost %s.', serverSizeRequired, formatMoney(cost));

  const myMoney = ns.getServerMoneyAvailable('home');
  if (cost > myMoney) {
    ns.tprint('ERROR Cannot afford server right now. Exiting.');
    ns.exit();
  }

  return ns.purchaseServer(sourceName, serverSizeRequired);
};

const copyDependencies = async sourceName => {
  await ns.scp(DEPENDENCIES, sourceName);
};

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('scp');

  if (!ns.args[0]) {
    ns.tprint('ERROR No target server given. Exiting.');
    ns.exit();
  }

  const targetName = ns.args[0];
  const sourceName = ns.sprintf('Attack%s', targetName.toUpperCase());
  ns.tprintf(
    'INFO Purchasing and configuring server %s to attack target %s',
    sourceName,
    targetName
  );

  if (ns.getPurchasedServers().includes(sourceName)) {
    ns.tprintf('WARN You already own a server called %s. Re-configuring it.', sourceName);
    ns.tprintf('Killing all processes on %s. Waiting 2 seconds.', sourceName);
    ns.killall(sourceName);
    await ns.sleep(2000);
  } else {
    const newServerName = purchaseServer(sourceName, targetName);
    if (newServerName === sourceName) {
      ns.tprintf('SUCCESS Bought new server.');
    } else {
      ns.tprintf('ERROR Something went wrong when buying new server. Exiting.');
      ns.exit();
    }
  }

  ns.tprintf('Copying all dependencies to %s...', sourceName);
  await copyDependencies(sourceName);

  ns.tprintf('Final step: running SingleAttack.js...');
  const result = ns.exec('singleAttack.js', sourceName, 1, targetName);
  if (result === 0) {
    ns.tprint('ERROR Running script. Exiting.');
    ns.exit();
  } else {
    ns.tprintf('SUCCESS Everything seems to be working. Happy leaning back and earning money');
  }
}
