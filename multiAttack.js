/** @type import(".").NS */
let ns = null;

import logServerInfo from '/helpers/logServerInfo';
import { calcPossibleThreads, calcAttackDelays, calcAttackTimes, calcMaxThreads } from 'helpers/ramCalculations';
import { formatTime, formatDuration, formatMoney, formatNumber } from '/helpers/formatters';
import { BUFFER, SECOND } from '/helpers/globals';

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

  ns.printf('INFO threads: hack %11d\tgrow %11d\tweaken %11d', hackThreads, growThreads, weakenThreads);

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

  ns.printf('INFO ' + '-'.repeat(69));

  ns.printf(
    'INFO sums:    hack %s\tgrow %s\tweaken %s',
    formatDuration(ns, hackTime + hackDelay, true),
    formatDuration(ns, growTime + growDelay, true),
    formatDuration(ns, weakenTime + weakenDelay, true)
  );

  ns.printf('Attack waves every %s', formatDuration(ns, sleepTime, true));
};

const primeServer = async (sourceName, targetName) => {
  ns.printf('INFO %s PRIMING server %s from %s...', formatTime(ns), targetName, sourceName);
  const pid = ns.exec(SCRIPTS.primeServer, sourceName, 1, targetName);
  while (ns.isRunning(pid)) {
    await ns.asleep(SECOND);
  }
};

const performAttack = async (sourceName, targetName, flags) => {
  const maxShifts = flags.shifts;

  while (true) {
    const threadCounts = calcPossibleThreads(ns, targetName, sourceName);
    const attackTimes = calcAttackTimes(ns, targetName, threadCounts);
    const attackDelays = calcAttackDelays(attackTimes);

    printTimes(threadCounts, attackTimes, attackDelays);
    checkThreads(threadCounts);
    checkDelays(attackDelays);

    const { growThreads, hackThreads, weakenThreads } = threadCounts;
    const { growDelay, hackDelay, weakenDelay, sleepTime } = attackDelays;

    const shiftThreads = growThreads + hackThreads + weakenThreads;
    const shiftRam = shiftThreads * ns.getScriptRam(SCRIPTS.weaken);
    const availableRam = ns.getServerMaxRam(sourceName) - ns.getScriptRam('multiAttack.js');

    const ramShifts = Math.floor(availableRam / shiftRam);
    const timeShifts = Math.floor(sleepTime / BUFFER);
    const shifts = Math.min(ramShifts, timeShifts, maxShifts);

    for (let shift = 0; shift < shifts; shift++) {
      // logServerInfo(ns, targetName);
      ns.exec(SCRIPTS.hack, sourceName, hackThreads, targetName, hackDelay, shift);
      ns.exec(SCRIPTS.grow, sourceName, growThreads, targetName, growDelay, shift);
      ns.exec(SCRIPTS.weaken, sourceName, weakenThreads, targetName, weakenDelay, shift);

      // sleep one BUFFER until starting the next shift
      await ns.sleep(BUFFER);
    }

    // sleep as many buffers remaining due to unused shifts
    const timeUntilNextShift = Math.round(sleepTime - BUFFER * shifts);
    // ns.printf('WARN Sleeping %s until starting next shift...', formatDuration(ns, timeUntilNextShift));
    await ns.sleep(timeUntilNextShift);
  }
};

const testAttack = async (sourceName, targetName, threadCounts, attackDelays, attackTimes) => {
  const { growThreads, hackThreads, weakenThreads } = threadCounts;
  const { growDelay, hackDelay, weakenDelay, sleepTime } = attackDelays;

  const shiftThreads = growThreads + hackThreads + weakenThreads;
  const shiftRam = shiftThreads * ns.getScriptRam(SCRIPTS.weaken);
  const availableRam = ns.getServerMaxRam(sourceName) - ns.getScriptRam('multiAttack.js');

  const ramShifts = Math.floor(availableRam / shiftRam);
  const timeShifts = Math.floor(sleepTime / BUFFER);
  const shifts = Math.min(ramShifts, timeShifts);

  ns.printf(
    'INFO %s Threads: %d, RAM %s/%s, shifts: %d (ram: %d, time: %d), duration: %s, BUFFER: %d',
    formatTime(ns),
    shiftThreads,
    formatNumber(ns, shiftRam),
    formatNumber(ns, availableRam),
    shifts,
    ramShifts,
    timeShifts,
    formatDuration(ns, sleepTime),
    BUFFER
  );

  logServerInfo(ns, targetName);
  ns.exec(SCRIPTS.hack, sourceName, hackThreads, targetName, hackDelay, 0);
  ns.exec(SCRIPTS.grow, sourceName, growThreads, targetName, growDelay, 0);
  ns.exec(SCRIPTS.weaken, sourceName, weakenThreads, targetName, weakenDelay, 0);

  await ns.sleep(sleepTime + 5 * SECOND);
  logServerInfo(ns, targetName);
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
    ns.tprintf('growDelay: %d, hackDelay: %d, weakenDelay: %d', growDelay, hackDelay, weakenDelay);
    ns.exit();
  }
};

const prepareAttack = async (sourceName, targetName, flags) => {
  if (flags.noop) {
    ns.exit();
  }

  await primeServer(sourceName, targetName);

  if (flags.test) {
    await testAttack(sourceName, targetName, attackTimes);
  } else {
    await performAttack(sourceName, targetName, flags);
  }
};

export function autocomplete(data) {
  return [...data.servers, '--noop', '--killall', '--test', '--tail'];
}

export async function main(_ns) {
  ns = _ns;

  const flags = ns.flags([
    ['killall', false],
    ['noop', false],
    ['test', false],
    ['shifts', 1000],
  ]);

  ns.clearLog();
  ns.disableLog('disableLog');
  ns.disableLog('asleep');
  ns.disableLog('sleep');
  ns.disableLog('getServerMinSecurityLevel');
  ns.disableLog('getServerMaxRam');
  ns.disableLog('getServerUsedRam');

  if (flags.test) {
    ns.tail();
  } else {
    ns.disableLog('exec');
    ns.disableLog('killall');
  }

  const targetName = ns.args[0];
  const sourceName = ns.getServer().hostname;

  if (flags.killall) {
    ns.tprintf('WARN Killing all multihack Scripts on %s', sourceName);
    for (const script of Object.values(SCRIPTS)) {
      ns.scriptKill(script, sourceName);
    }

    await ns.asleep(SECOND);
  }

  await prepareAttack(sourceName, targetName, flags);
}
