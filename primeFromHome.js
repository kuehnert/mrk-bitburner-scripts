/** @type import(".").NS */
let ns = null;

import logServerInfo, { isServerPrimed } from 'helpers/logServerInfo';
import { getViableTargets } from '/helpers/getServers';
import { getGrowPercent } from 'helpers/fakeFormulas';
import { formatDuration, MINUTE, SECOND } from '/helpers/formatters';

const runThreaded = (script, sourceName, targetName, threads) => {
  if (threads > 0) {
    const result = ns.exec(script, sourceName, threads, targetName);

    if (result === 0) {
      ns.printf('Error running %s script. Aborting.', script);
      ns.exit();
    }
  }
};

const calcGrowThreads = serverData =>
  Math.round(Math.log(2) / Math.log(getGrowPercent(ns, serverData)));

const calcWeakenThreads = serverData => {
  const currentSecurity = ns.getServerSecurityLevel(serverData.hostname);
  const minSecurity = ns.getServerMinSecurityLevel(serverData.hostname);
  const weakenDifference = currentSecurity - minSecurity;
  return Math.round(weakenDifference / 0.02);
};

const primeServer = async targetName => {
  const weakenCost = ns.getScriptRam('/workers/miniweaken.js', 'home');
  const growCost = ns.getScriptRam('/workers/minigrow.js', 'home');
  let target = ns.getServer(targetName);

  while (!isServerPrimed(ns, target)) {
    logServerInfo(ns, targetName);
    const availableRam = ns.getServerMaxRam('home') - ns.getServerUsedRam('home');

    const optimalGrowThreads = calcGrowThreads(target);
    const maximalGrowThreads = Math.floor(availableRam / growCost);
    const growThreads = Math.min(optimalGrowThreads, maximalGrowThreads);

    const optimalWeakenThreads = calcWeakenThreads(target);
    const maximalWeakenThreads = Math.floor((availableRam - growThreads * growCost) / weakenCost);
    const weakenThreads = Math.min(maximalWeakenThreads, optimalWeakenThreads);

    const growTime = ns.getGrowTime(targetName);
    const weakenTime = ns.getWeakenTime(targetName);
    const waitTime = Math.max(weakenTime, growTime) + 100;
    ns.printf(
      'target %s: running %d grow threads and %d weaken threads (%s)...',
      targetName,
      growThreads,
      weakenThreads,
      formatDuration(ns, waitTime)
    );

    runThreaded('/workers/miniweaken.js', 'home', targetName, weakenThreads);
    runThreaded('/workers/minigrow.js', 'home', targetName, growThreads);
    await ns.sleep(waitTime);
    target = ns.getServer(targetName);
  }
};

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('exec');
  ns.disableLog('getServerMaxRam');
  ns.disableLog('getServerMinSecurityLevel');
  ns.disableLog('getServerSecurityLevel');
  ns.disableLog('getServerUsedRam');
  ns.disableLog('getServerMaxMoney');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('getServerNumPortsRequired');
  ns.disableLog('sleep');

  while (true) {
    // get servers that make good targets but are not yet being attacked
    const viableServers = await getViableTargets(ns);

    if (viableServers.length === 0) {
      ns.print('No viable targets present. Sleeping');
      await ns.sleep(2 * MINUTE);
    } else {
      const target = viableServers.shift();
      await primeServer(target.hostname);
      await ns.sleep(SECOND);
    }
  }
}
