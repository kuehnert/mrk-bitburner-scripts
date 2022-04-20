/** @type import(".").NS */
let ns = null;

import { getViableTargets } from '/helpers/getServers';
import { formatMoney } from '/helpers/formatters';
import { calcTotalRamCost } from '/helpers/ramCalculations';
import { source2TargetName, target2SourceName } from '/helpers/names';

export const autocomplete = data => ['all', 'delete-all', 'redeploy', ...data.servers];

const singleScript = 'singleAttack.js';
const parallelScript = 'multiAttack.js';

const DEPENDENCIES = [
  singleScript,
  parallelScript,
  '/helpers/fakeFormulas.js',
  '/helpers/formatters.js',
  '/helpers/logServerInfo.js',
  '/helpers/ramCalculations.js',
  '/workers/delayedGrow.js',
  '/workers/delayedHack.js',
  '/workers/delayedWeaken.js',
  '/workers/minigrow.js',
  '/workers/minihack.js',
  '/workers/miniweaken.js',
  '/workers/primeServer.js',
];

const purchaseServer = (sourceName, targetName, parallel) => {
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
  const { serverSizeRequired, parallelServerSizeRequired } = calcTotalRamCost(ns, targetName, true);
  const desiredRam = parallel ? parallelServerSizeRequired : serverSizeRequired;
  const cost = ns.getPurchasedServerCost(desiredRam);
  ns.tprintf('We need a server with %d GB. Cost %s.', desiredRam, formatMoney(ns, cost));

  const myMoney = ns.getServerMoneyAvailable('home');
  if (cost > myMoney) {
    ns.tprint('ERROR Cannot afford server right now. Exiting.');
    ns.exit();
  }

  return ns.purchaseServer(sourceName, desiredRam);
};

const copyDependencies = async sourceName => {
  await ns.scp(DEPENDENCIES, sourceName);
};

const deployServer = async (targetName, parallel) => {
  const sourceName = target2SourceName(targetName);

  ns.tprintf(
    'INFO Purchasing and configuring server %s to attack target %s',
    sourceName,
    targetName
  );

  if (ns.getPurchasedServers().includes(sourceName)) {
    ns.tprintf('WARN You already own a server called %s. Re-configuring it.', sourceName);
    ns.tprintf('Killing all processes on %s. Waiting 2 seconds.', sourceName);
    ns.killall(sourceName);
    await ns.sleep(500);
  } else {
    const newServerName = purchaseServer(sourceName, targetName, parallel);
    if (newServerName === sourceName) {
      ns.tprintf('SUCCESS Bought new server.');
    } else {
      ns.tprintf('ERROR Something went wrong when buying new server. Exiting.');
      ns.exit();
    }
  }

  ns.tprintf('Copying all dependencies to %s...', sourceName);
  await copyDependencies(sourceName);

  // ns.tprintf('Final step: running SingleAttack.js...');
  const script = parallel ? parallelScript : singleScript;
  const result = ns.exec(script, sourceName, 1, targetName);

  if (result === 0) {
    ns.tprint('ERROR Running script. Exiting.');
    ns.exit();
  } else {
    // ns.tprintf('SUCCESS Everything seems to be working. Happy leaning back and earning money');
  }
};

const deleteServer = sourceName => {
  if (!ns.getPurchasedServers().includes(sourceName)) {
    ns.tprintf("ERROR You don't own a server called %s. Exiting.", sourceName);
    ns.exit();
  }

  // kill all running scripts
  ns.killall(sourceName);

  // delete server
  const result = ns.deleteServer(sourceName);
  if (result) {
    ns.tprintf('INFO Successfully deleted server %s', sourceName);
  } else {
    ns.tprintf('ERROR Unknown problem deleting server %s', sourceName);
  }
};

const redeployAll = async () => {
  const servers = ns.getPurchasedServers();

  for (const sourceName of servers) {
    const targetName = source2TargetName(sourceName);
    ns.killall(sourceName);
    await copyDependencies(sourceName);
    ns.exec('singleAttack.js', sourceName, 1, targetName);
  }

  ns.tprintf('Finished redeploying scripts to your %d servers', servers.length);
};

const deleteAll = async () => {
  ns.tprint('WARN Deleting all your purchased servers...');

  const servers = ns.getPurchasedServers();
  for (const sourceName of servers) {
    ns.killall(sourceName);
    ns.deleteServer(sourceName);
  }

  ns.tprint('Done.');
};

const deployAll = async () => {
  // try to attack as many servers as possible
  const serverLimit = ns.getPurchasedServerLimit();
  const currentServerCount = ns.getPurchasedServers().length;
  const remainingSeverCount = serverLimit - currentServerCount;
  const viableServers = await getViableTargets(ns);
  const targets = viableServers.slice(0, remainingSeverCount);

  for (const target of targets) {
    await deployServer(target.hostname, true);
  }
};

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('scp');

  const flags = ns.flags([
    ['debug', false],
    ['delete', false],
    ['parallel', true],
  ]);

  if (ns.args[0] == null) {
    ns.tprint('ERROR No target server given. Exiting.');
    ns.exit();
  }

  if (ns.args[0].toLowerCase() === 'delete-all') {
    await deleteAll();
  } else if (ns.args[0].toLowerCase() === 'redeploy') {
    await redeployAll();
  } else if (ns.args[0].toLowerCase() === 'all') {
    await deployAll();
  } else if (flags.delete) {
    deleteServer(target2SourceName(ns.args[0]));
  } else {
    const targetName = ns.args[0];
    await deployServer(targetName, flags.parallel);
  }
}