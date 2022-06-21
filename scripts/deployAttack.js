/** @type import(".").NS */
let ns = null;

import { getHackedServers, getViableTargets } from 'helpers/getServers';
import { formatMoney, formatNumber } from 'helpers/formatters';
import { calcMaxShifts, calcTotalRamCost } from './helpers/ramCalculations';
import { source2TargetName, target2SourceName } from 'helpers/names';
import isHackCandidate from 'helpers/isHackCandidate';
import getMyPortLevel from 'helpers/getMyPortLevel';
import { getPurchasedServerCosts, getAffordableMaxServerRam } from 'helpers/purchasedServers';
import { miniHackScript, miniGrowScript, miniWeakenScript } from 'helpers/globals';

const singleScript = 'singleAttack.js';
const parallelScript = 'multiAttack.js';

const DEPENDENCIES = [
  '/helpers/fakeFormulas.js',
  '/helpers/formatters.js',
  '/helpers/globals.js',
  '/helpers/logServerInfo.js',
  '/helpers/ramCalculations.js',
  '/workers/delayedGrow.js',
  '/workers/delayedHack.js',
  '/workers/delayedWeaken.js',
  '/workers/primeServer.js',
  miniGrowScript,
  miniHackScript,
  miniWeakenScript,
  parallelScript,
  singleScript,
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

const purchaseServer = (sourceName, targetName, parallel = true, shifts = 1, maxShifts = false) => {
  checkPurchasedServerCountLimit();
  let realShifts = maxShifts ? calcMaxShifts(ns, targetName) : shifts;
  const { serverSizeRequired, parallelServerSizeRequired } = calcTotalRamCost(
    ns,
    targetName,
    'foodnstuff',
    realShifts
  );
  const desiredRam = parallel ? parallelServerSizeRequired : serverSizeRequired;
  const cost = ns.getPurchasedServerCost(desiredRam);

  const myMoney = ns.getServerMoneyAvailable('home');
  if (cost > myMoney) {
    ns.tprintf(
      'WARN Cannot afford server to attack %s right now (%s/%s). Exiting.',
      targetName,
      formatMoney(ns, myMoney),
      formatMoney(ns, cost)
    );

    ns.exit();
  }

  return { hostname: ns.purchaseServer(sourceName, desiredRam), ram: desiredRam, cost, realShifts };
};

const purchaseBomb = sourceName => {
  checkPurchasedServerCountLimit();
  const desiredRam = getAffordableMaxServerRam(ns);

  if (desiredRam === 0) {
    ns.tprint('ERROR Cannot afford any server right now. Exiting.');
    ns.exit();
  }

  return ns.purchaseServer(sourceName, desiredRam);
};

const copyDependencies = async sourceName => {
  await ns.scp(DEPENDENCIES, sourceName);
};

const deployServer = async (targetName, { parallel, bomb, shifts, maxShifts }) => {
  const sourceName = target2SourceName(targetName);

  if (ns.getPurchasedServers().includes(sourceName)) {
    ns.tprintf(
      'WARN You already own server %s. Stopping all threads & re-configuring it.',
      sourceName
    );
    ns.killall(sourceName);
    // await ns.sleep(300);
  } else {
    if (bomb) {
      purchaseBomb(sourceName);
    } else {
      const { hostname, ram, cost, realShifts } = purchaseServer(
        sourceName,
        targetName,
        parallel,
        shifts,
        maxShifts
      );
      if (hostname === sourceName) {
        ns.tprintf(
          'SUCCESS Bought new server %s for working %d shifts with %d GB for %s.',
          hostname,
          realShifts,
          ram,
          formatMoney(ns, cost)
        );
      } else {
        ns.tprintf('ERROR Something went wrong when buying new server. Exiting.');
        ns.exit();
      }
    }
  }

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

const deleteServer = async sourceName => {
  if (!ns.getPurchasedServers().includes(sourceName)) {
    ns.tprintf("ERROR You don't own a server called %s. Exiting.", sourceName);
    ns.exit();
  }

  // kill all running scripts
  ns.killall(sourceName);
  await ns.sleep(300);

  // delete server
  const result = ns.deleteServer(sourceName);
  if (result) {
    ns.tprintf('INFO Successfully deleted server %s', sourceName);
  } else {
    ns.tprintf('ERROR Unknown problem deleting server %s', sourceName);
  }
};

const redeployAll = async ({ parallel }) => {
  const servers = ns.getPurchasedServers();

  for (const sourceName of servers) {
    ns.killall(sourceName);
  }
  await ns.sleep(2000);

  for (const sourceName of servers) {
    const targetName = source2TargetName(sourceName);
    await copyDependencies(sourceName);

    const script = parallel ? parallelScript : singleScript;
    ns.exec(script, sourceName, 1, targetName);
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
    await deleteServer(target2SourceName(deleteName));
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
    await ns.sleep(200);
    ns.deleteServer(sourceName);
  }

  ns.tprint('Done.');
};

const killAll = async () => {
  ns.tprint('INFO Stopping scripts on all your purchased servers...');

  const servers = ns.getPurchasedServers();
  for (const sourceName of servers) {
    ns.killall(sourceName);
  }
};

const deployAll = async flags => {
  // try to attack as many servers as possible
  const serverLimit = ns.getPurchasedServerLimit();
  const currentServerCount = ns.getPurchasedServers().length;
  const remainingSeverCount = serverLimit - currentServerCount;
  const viableServers = await getViableTargets(ns);

  const targets = viableServers
    .sort(
      (a, b) =>
        (a.attackServerSize - b.attackServerSize) * 100 + (b.hackMoneyPerTime - a.hackMoneyPerTime)
    )
    .slice(0, remainingSeverCount);

  ns.tprintf('Considering targets in order: %s', targets.map(s => s.hostname).join(', '));

  if (viableServers.length === 0) {
    ns.tprintf('WARN There currently are no viable targets. Exiting');
  } else if (currentServerCount === serverLimit) {
    ns.tprintf(
      'WARN You already own a maximum %d out of %d servers. Exiting',
      currentServerCount,
      serverLimit
    );
  } else {
    for (const target of targets) {
      await deployServer(target.hostname, flags);
    }
  }
};

const printServerCost = () => {
  const pricelist = getPurchasedServerCosts(ns);
  // ns.tprintf('pricelist: %s', JSON.stringify(pricelist, null, 4));
  for (const { ram, cost, affordable } of pricelist) {
    ns.tprintf(
      '1 Server with %s GB:\t%s\t%dx',
      formatNumber(ns, ram),
      formatMoney(ns, cost),
      affordable
    );
  }
};

export const autocomplete = data => [
  '--bomb',
  '--delete',
  '--maxShifts',
  '--shifts',
  'all',
  'cost',
  'delete-all',
  'exp',
  'kill-all',
  'redeploy',
  'redistribute',
  'stats',
  ...data.servers,
];

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();
  const flags = ns.flags([
    ['bomb', false], // create a server with max RAM to optimise hacking skill gain
    ['debug', false],
    ['delete', false],
    ['parallel', true],
    ['maxShifts', false],
    ['shifts', 1],
  ]);

  if (!flags.debug) {
    ns.disableLog('disableLog');
    ns.disableLog('killall');
    ns.disableLog('exec');
    ns.disableLog('scp');
  }

  if (ns.args.length === 0) {
    ns.tprint('ERROR No target server or command given. Exiting.');
    ns.exit();
  } else if (ns.args[0].toLowerCase() === 'delete-all') {
    await deleteAll();
  } else if (ns.args[0].toLowerCase() === 'kill-all') {
    await killAll();
  } else if (ns.args[0].toLowerCase() === 'all') {
    await deployAll(flags);
  } else if (ns.args[0].toLowerCase() === 'cost') {
    printServerCost();
    ns.exit();
  } else if (ns.args[0].toLowerCase() === 'redeploy') {
    await redeployAll(flags);
  } else if (ns.args[0].toLowerCase() === 'redistribute') {
    await redistribute();
  } else if (ns.args[0].toLowerCase() === 'stats') {
    ns.run('/helpers/calcAttackStats.js', 1);
    ns.exit();
  } else if (ns.args[0].toLowerCase() === 'exp') {
    ns.run('/helpers/calcAttackStats.js', 1, '--exp');
    ns.exit();
  } else if (flags.delete) {
    await deleteServer(target2SourceName(ns.args[0]));
  } else {
    const targetName = ns.args[0];
    await deployServer(targetName, flags);
  }

  ns.run('scanServers.js', 1, '--forceRefresh', '--quiet');
}
