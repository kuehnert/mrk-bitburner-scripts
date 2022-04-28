/** @type import(".").NS */
let ns = null;

import { calcTotalRamCost, calcAttackTimes } from './helpers/ramCalculations';
import { formatTime, formatDuration, SECOND } from './helpers/formatters';
import logServerInfo from './helpers/logServerInfo';
import { BUFFER } from '/helpers/globals'

export function autocomplete(data) {
  return [...data.servers]; // This script autocompletes the list of servers.
}

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('sleep');
  ns.disableLog('getServerMinSecurityLevel');
  // ns.disableLog('getServerSecurityLevel');
  // ns.disableLog('getServerMaxRam');
  // ns.disableLog('getServerUsedRam');
  ns.tail();

  const targetName = ns.args[0];
  const sourceName = ns.getServer().hostname;

  ns.printf('INFO PRIMING server %s from home...', targetName);
  const pid = ns.exec('/workers/primeServer.js', 'home', 1, targetName);
  while (ns.isRunning(pid)) {
    await ns.sleep(SECOND);
  }

  ns.printf('INFO Starting queued attack...');
  const { growThreads, hackThreads, weakenThreads } = calcTotalRamCost(ns, targetName);
  const { growTime, hackTime, weakenTime } = calcAttackTimes(ns, targetName);

  const growDelay = weakenTime - BUFFER - growTime;
  const hackDelay = weakenTime - 2 * BUFFER - hackTime;
  const weakenDelay = 0; // assume weaken always takes longest
  const sleepTime = weakenTime + BUFFER;

  ns.printf(
    'INFO times:  grow %s\thack %s\tweaken %s',
    formatDuration(ns, growTime, true),
    formatDuration(ns, hackTime, true),
    formatDuration(ns, weakenTime, true)
  );
  ns.printf(
    'INFO delays: grow %s\thack %s\tweaken %s',
    formatDuration(ns, growDelay, true),
    formatDuration(ns, hackDelay, true),
    formatDuration(ns, weakenDelay, true)
  );
  ns.printf(
    'INFO sums:   grow %s\thack %s\tweaken %s',
    formatDuration(ns, growTime + growDelay, true),
    formatDuration(ns, hackTime + hackDelay, true),
    formatDuration(ns, weakenTime + weakenDelay, true)
  );
  ns.printf('Attack waves every %s', formatDuration(ns, sleepTime, true));

  // ns.exit();

  if (growDelay < 0 || hackDelay < 0 || weakenDelay < 0) {
    ns.print('ERROR Something went horribly wrong. Exiting.');
    ns.exit();
  }

  while (true) {
    // assume primed server
    ns.printf('INFO %s Starting new attack...', formatTime(ns));
    logServerInfo(ns, targetName);
    ns.exec('workers/delayedHack.js', sourceName, hackThreads, targetName, hackDelay);
    ns.exec('workers/delayedGrow.js', sourceName, growThreads, targetName, growDelay);
    ns.exec('workers/delayedWeaken.js', sourceName, weakenThreads, targetName, weakenDelay);

    await ns.sleep(sleepTime);
  }
}
