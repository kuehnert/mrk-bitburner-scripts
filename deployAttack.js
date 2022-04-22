/** @type import(".").NS */
let ns = null;

import { getHackedServers, getViableTargets } from '/helpers/getServers';
import { formatMoney, formatNumber } from '/helpers/formatters';
import { calcTotalRamCost } from '/helpers/ramCalculations';
import { source2TargetName, target2SourceName } from '/helpers/names';
import isHackCandidate from '/helpers/isHackCandidate';
import getMyPortLevel from '/helpers/getMyPortLevel';
import { getAffordableMaxServerRam } from '/helpers/purchasedServers';

export const autocomplete = data => [
  'all',
  'delete-all',
  'redeploy',
  'redistribute',
  ...data.servers,
];

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

const checkPurchasedServerCountLimit = () => {
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
};

const purchaseServer = (sourceName, targetName, parallel) => {
  checkPurchasedServerCountLimit();
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

const purchaseBomb = sourceName => {
  checkPurchasedServerCountLimit();
  const desiredRam = getAffordableMaxServerRam(ns);

  if (desiredRam === 0) {
    ns.tprint('ERROR Cannot afford any server right now. Exiting.');
    ns.exit();
  }

  ns.printf('desiredRam: %s', formatNumber(ns, desiredRam));

  return ns.purchaseServer(sourceName, desiredRam);
};

const copyDependencies = async sourceName => {
  await ns.scp(DEPENDENCIES, sourceName);
};

const deployServer = async (targetName, parallel, bomb = false) => {
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
    if (bomb) {
      purchaseBomb(sourceName);
    } else {
      const newServerName = purchaseServer(sourceName, targetName, parallel);
      if (newServerName === sourceName) {
        ns.tprintf('SUCCESS Bought new server.');
      } else {
        ns.tprintf('ERROR Something went wrong when buying new server. Exiting.');
        ns.exit();
      }
    }
  }

  ns.tprintf('Copying all dependencies to %s...', sourceName);
  await copyDependencies(sourceName);

  const script = parallel ? parallelScript : singleScript;
  let result;
  if (bomb) {
    result = ns.exec(script, sourceName, 1, targetName, '--bomb');
  } else {
    result = ns.exec(script, sourceName, 1, targetName);
  }

  if (result === 0) {
    ns.tprint('ERROR Running script. Exiting.');
    ns.exit();
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

const redistribute = async () => {
  // ensure that all the top targets are being attacked
  const serverLimit = ns.getPurchasedServerLimit();
  let viableServers = await getHackedServers(ns);
  viableServers = viableServers
    .filter(s => isHackCandidate(ns, s, getMyPortLevel(ns)))
    .sort((a, b) => b.hackMoneyPerTime - a.hackMoneyPerTime);
  const top25 = viableServers.slice(0, serverLimit);
  const toAttack = top25.filter(s => !s.isAttacked).map(s => s.hostname);

  ns.tprintf(
    'Currently attacking %d/%d of the top targets',
    serverLimit - toAttack.length,
    serverLimit
  );
  ns.tprintf('targeting: %s', toAttack);

  const toDelete = viableServers
    .filter(s => s.isAttacked && !top25.includes(s))
    .map(s => s.hostname);
  ns.tprintf('toDelete: %s', toDelete);

  for (const deleteName of toDelete) {
    deleteServer(target2SourceName(deleteName));
  }

  for (const deployName of toAttack) {
    await deployServer(deployName, true);
  }
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
    ['bomb', false], // create a server with max RAM to optimise hacking skill gain
  ]);

  if (ns.args[0] == null) {
    ns.tprint('ERROR No target server given. Exiting.');
    ns.exit();
  }

  if (ns.args[0].toLowerCase() === 'delete-all') {
    await deleteAll();
  } else if (ns.args[0].toLowerCase() === 'all') {
    await deployAll();
  } else if (ns.args[0].toLowerCase() === 'redeploy') {
    await redeployAll();
  } else if (ns.args[0].toLowerCase() === 'redistribute') {
    await redistribute();
  } else if (flags.delete) {
    deleteServer(target2SourceName(ns.args[0]));
  } else {
    const targetName = ns.args[0];
    await deployServer(targetName, flags.parallel, flags.bomb);
  }
}
