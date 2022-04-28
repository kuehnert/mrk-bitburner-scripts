/** @type import(".").NS */
let ns = null;

import {
  calcPossibleThreads,
  calcAttackDelays,
  calcAttackTimes,
  calcMaxThreads,
} from 'helpers/ramCalculations';
import { formatTime, formatDuration, SECOND } from '/helpers/formatters';
import logServerInfo from '/helpers/logServerInfo';
import { BUFFER } from '/helpers/globals'

export function autocomplete(data) {
  return [...data.servers]; // This script autocompletes the list of servers.
}

const SCRIPTS = {
  grow: '/workers/delayedGrow.js',
  hack: '/workers/delayedHack.js',
  weaken: '/workers/delayedWeaken.js',
  primeServer: '/workers/primeServer.js',
};

const printTimes = (threadCounts, attackTimes, attackDelays) => {
  const { growThreads, hackThreads, weakenThreads } = threadCounts;
  const { growTime, hackTime, weakenTime } = attackTimes;
  const { growDelay, hackDelay, weakenDelay, sleepTime } = attackDelays;

  ns.printf(
    'INFO threads: hack %11d\tgrow %11d\tweaken %11d',
    hackThreads,
    growThreads,
    weakenThreads
  );

  ns.printf(
    'INFO times:   hack %s\tgrow %s\tweaken %s',
    formatDuration(ns, hackTime, true),
    formatDuration(ns, growTime, true),
    formatDuration(ns, weakenTime, true)
  );

  ns.printf(
    'INFO delays:  hack %s\tgrow %s\tweaken %s',
    formatDuration(ns, hackDelay, true),
    formatDuration(ns, growDelay, true),
    formatDuration(ns, weakenDelay, true)
  );

  ns.print('INFO ' + '-'.repeat(69));

  ns.printf(
    'INFO sums:   hack %s\tgrow %s\tweaken %s',
    formatDuration(ns, hackTime + hackDelay, true),
    formatDuration(ns, growTime + growDelay, true),
    formatDuration(ns, weakenTime + weakenDelay, true)
  );

  ns.printf('Attack waves every %s', formatDuration(ns, sleepTime, true));
};

const primeServer = async (sourceName, targetName) => {
  ns.printf(
    'INFO %s PRIMING server %s from %s...',
    formatTime(ns),
    targetName,
    sourceName
  );
  const pid = ns.exec(SCRIPTS.primeServer, sourceName, 1, targetName);
  while (ns.isRunning(pid)) {
    await ns.sleep(SECOND);
  }
};

const performAttack = async (
  sourceName,
  targetName,
  threadCounts,
  attackDelays
) => {
  const { growThreads, hackThreads, weakenThreads } = threadCounts;
  const { growDelay, hackDelay, weakenDelay, sleepTime } = attackDelays;

  while (true) {
    // assume primed server
    ns.printf('INFO %s Starting new attack...', formatTime(ns));
    logServerInfo(ns, targetName);
    ns.exec(SCRIPTS.hack, sourceName, hackThreads, targetName, hackDelay);
    ns.exec(SCRIPTS.grow, sourceName, growThreads, targetName, growDelay);
    ns.exec(SCRIPTS.weaken, sourceName, weakenThreads, targetName, weakenDelay);

    await ns.sleep(sleepTime);
  }
};

const checkThreads = threadCounts => {
  const allOK = Object.values(threadCounts).every(v => v >= 1);

  if (!allOK) {
    ns.tprint('ERROR Not enough RAM for multi-attack. Exiting.');
    ns.exit();
  }
};

const checkDelays = attackDelays => {
  const { growDelay, hackDelay, weakenDelay } = attackDelays;

  if (growDelay < 0 || hackDelay < 0 || weakenDelay < 0) {
    ns.tprint('ERROR Something went horribly wrong concerning the delays. Exiting.');
    ns.exit();
  }
};

const prepareAttack = async (sourceName, targetName, flags) => {
  const threadCounts = calcPossibleThreads(ns, targetName);
  const attackTimes = calcAttackTimes(ns, targetName);
  const attackDelays = calcAttackDelays(attackTimes);

  printTimes(threadCounts, attackTimes, attackDelays);

  checkThreads(threadCounts);
  checkDelays(attackDelays);

  if (flags.noop) {
    ns.exit();
  }

  await primeServer(sourceName, targetName);
  await performAttack(sourceName, targetName, threadCounts, attackDelays);
};

const bombAttack = async (sourceName, targetName) => {
  ns.tprintf('WARN Bombing server %s with all my might!', targetName);
  const threadCounts = calcMaxThreads(ns, sourceName);
  const attackTimes = calcAttackTimes(ns, targetName);
  const attackDelays = calcAttackDelays(attackTimes);

  printTimes(threadCounts, attackTimes, attackDelays);
  checkDelays(attackDelays);

  await performAttack(sourceName, targetName, threadCounts, attackDelays);
};

export async function main(_ns) {
  ns = _ns;
  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('sleep');
  ns.disableLog('getServerMinSecurityLevel');
  // ns.tail();

  const targetName = ns.args[0];
  const sourceName = ns.getServer().hostname;

  const flags = ns.flags([
    ['noop', false],
    ['killall', false],
    ['bomb', false],
  ]);

  if (flags.killall) {
    ns.tprintf('WARN Killing all multihack Scripts on %s', sourceName);
    for (const script of Object.values(SCRIPTS)) {
      ns.scriptKill(script, sourceName);
    }
  } else if (flags.bomb) {
    await bombAttack(sourceName, targetName);
  } else {
    await prepareAttack(sourceName, targetName, flags);
  }
}
